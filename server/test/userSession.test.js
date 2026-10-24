const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const { admin } = require('../firebase-service-account');
const User = require('../models/User');
const userRoutes = require('../routes/userRoutes');
const { startApi } = require('./helpers/api');

const authorization = 'Bearer verified-token';
const minute = 60 * 1000;
let api;
let firebaseApp;

before(async () => {
  firebaseApp = admin.initializeApp({ projectId: 'recipe-book-tests' });
  api = await startApi('/api/users', userRoutes);
});

after(async () => {
  if (api) await api.close();
  if (firebaseApp) await firebaseApp.delete();
});

function mockBoundaries(t, { inactiveMinutes = 1, sessionTimeout } = {}) {
  const user = new User({
    uid: 'owner',
    name: 'Original name',
    email: 'owner@example.com',
    lastActive: new Date(Date.now() - inactiveMinutes * minute),
    sessionTimeout,
  });
  return {
    user,
    verify: t.mock.method(admin.auth(), 'verifyIdToken', async () => ({ uid: 'owner' })),
    find: t.mock.method(User, 'findOne', async () => user),
    save: t.mock.method(User.prototype, 'save', async function () { return this; }),
  };
}

for (const [method, path] of [
  ['GET', '/current'],
  ['PUT', '/profile'],
  ['POST', '/like/507f1f77bcf86cd799439011'],
  ['DELETE', '/unlike/507f1f77bcf86cd799439011'],
  ['POST', '/follow/other-user'],
  ['DELETE', '/unfollow/other-user'],
]) {
  test(`${method} ${path} requires authentication before accessing users`, async t => {
    const mocks = mockBoundaries(t);

    const response = await api.request(method, path);

    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
    assert.equal(mocks.verify.mock.callCount(), 0);
    assert.equal(mocks.find.mock.callCount(), 0);
    assert.equal(mocks.save.mock.callCount(), 0);
  });
}

test('a rejected Firebase token cannot read or modify a profile', async t => {
  const mocks = mockBoundaries(t);
  mocks.verify.mock.mockImplementation(async () => { throw new Error('Token expired'); });
  t.mock.method(console, 'error', () => {});

  const response = await api.request('PUT', '/profile', {
    authorization: 'Bearer rejected-token',
    body: { name: 'Changed name' },
  });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
  assert.deepEqual(mocks.verify.mock.calls[0].arguments, ['rejected-token']);
  assert.equal(mocks.find.mock.callCount(), 0);
  assert.equal(mocks.save.mock.callCount(), 0);
  assert.equal(mocks.user.name, 'Original name');
});

for (const [name, options] of [
  ['default 30-minute timeout', { inactiveMinutes: 31 }],
  ['custom 5-minute timeout', { inactiveMinutes: 6, sessionTimeout: 5 }],
]) {
  test(`an expired session (${name}) cannot refresh activity or modify a profile`, async t => {
    const mocks = mockBoundaries(t, options);
    const original = mocks.user.toObject();

    const response = await api.request('PUT', '/profile', {
      authorization,
      body: { name: 'Changed name' },
    });

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, {
      success: false,
      message: 'Session expired. Please login again.',
      sessionExpired: true,
    });
    assert.equal(mocks.find.mock.callCount(), 1);
    assert.deepEqual(mocks.find.mock.calls[0].arguments, [{ uid: 'owner' }]);
    assert.equal(mocks.save.mock.callCount(), 0);
    assert.deepEqual(mocks.user.toObject(), original);
  });
}

for (const [name, options] of [
  ['default 30-minute timeout', { inactiveMinutes: 29 }],
  ['custom 120-minute timeout', { inactiveMinutes: 45, sessionTimeout: 120 }],
]) {
  test(`an active session (${name}) refreshes activity and updates only its own profile`, async t => {
    const mocks = mockBoundaries(t, options);
    const beforeRequest = Date.now();

    const response = await api.request('PUT', '/profile', {
      authorization,
      body: {
        uid: 'victim',
        name: 'Updated name',
        likedRecipes: ['507f1f77bcf86cd799439011'],
        followers: ['intruder'],
        sessionTimeout: 1000,
      },
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.uid, 'owner');
    assert.equal(response.body.data.name, 'Updated name');
    assert.equal(response.body.data.sessionTimeout, options.sessionTimeout || 30);
    assert.deepEqual(response.body.data.likedRecipes, []);
    assert.deepEqual(response.body.data.followers, []);
    assert.deepEqual(mocks.verify.mock.calls[0].arguments, ['verified-token']);
    assert.equal(mocks.find.mock.callCount(), 2);
    for (const call of mocks.find.mock.calls) {
      assert.deepEqual(call.arguments, [{ uid: 'owner' }]);
    }
    assert.ok(mocks.user.lastActive.getTime() >= beforeRequest);
    assert.ok(mocks.user.lastActive.getTime() <= Date.now());
    assert.equal(mocks.save.mock.callCount(), 2);
    for (const call of mocks.save.mock.calls) assert.equal(call.this, mocks.user);
  });
}

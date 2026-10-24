const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const { admin } = require('../firebase-service-account');
const Recipe = require('../models/Recipe');
const recipeRoutes = require('../routes/recipeRoutes');
const { startApi } = require('./helpers/api');

const recipeId = '507f1f77bcf86cd799439011';
const authorization = 'Bearer verified-token';
let api;
let firebaseApp;

before(async () => {
  firebaseApp = admin.initializeApp({ projectId: 'recipe-book-tests' });
  api = await startApi('/api/recipes', recipeRoutes);
});

after(async () => {
  if (api) await api.close();
  if (firebaseApp) await firebaseApp.delete();
});

function mockBoundaries(t, uid = 'owner') {
  return {
    verify: t.mock.method(admin.auth(), 'verifyIdToken', async () => ({ uid, email: `${uid}@example.com` })),
    find: t.mock.method(Recipe, 'findById', async () => null),
    remove: t.mock.method(Recipe, 'findByIdAndDelete', async () => null),
    save: t.mock.method(Recipe.prototype, 'save', async function () { return this; }),
  };
}

function makeRecipe() {
  return new Recipe({
    _id: recipeId,
    title: 'Tomato pasta',
    ingredients: 'Pasta, tomatoes',
    instructions: 'Cook and serve.',
    cuisineType: 'Italian',
    preparationTime: 20,
    categories: ['Dinner'],
    addedBy: { userId: 'owner', userEmail: 'owner@example.com' },
    likeCount: 5,
  });
}

// Use the validator's current request fields to reach the ownership check.
const updateBody = {
  title: 'Changed title',
  image: 'https://example.com/pasta.jpg',
  ingredients: ['Pasta', 'tomatoes'],
  instructions: 'Cook and serve.',
  cuisineType: 'Italian',
  prepTime: 20,
  preparationTime: 20,
  categories: ['Dinner'],
  userId: 'owner',
  userEmail: 'owner@example.com',
  userName: 'Owner',
  addedBy: { userId: 'owner', userEmail: 'owner@example.com' },
  likeCount: 999,
};

const mutations = [
  ['POST', '/'],
  ['PUT', `/${recipeId}`],
  ['DELETE', `/${recipeId}`],
  ['POST', `/${recipeId}/like`],
];

for (const [method, path] of mutations) {
  for (const [name, header] of [
    ['missing token', undefined],
    ['non-Bearer token', 'Basic unverified-token'],
    ['rejected token', 'Bearer rejected-token'],
  ]) {
    test(`${method} ${path} rejects a ${name} before accessing recipes`, async t => {
      const mocks = mockBoundaries(t);
      if (name === 'rejected token') {
        mocks.verify.mock.mockImplementation(async () => { throw new Error('Token expired'); });
        t.mock.method(console, 'error', () => {});
      }

      const response = await api.request(method, path, { authorization: header, body: updateBody });

      assert.equal(response.status, 401);
      assert.equal(response.body.success, false);
      assert.match(response.body.message, /Unauthorized/);
      assert.equal(mocks.verify.mock.callCount(), name === 'rejected token' ? 1 : 0);
      if (name === 'rejected token') {
        assert.deepEqual(mocks.verify.mock.calls[0].arguments, ['rejected-token']);
      }
      assert.equal(mocks.find.mock.callCount(), 0);
      assert.equal(mocks.remove.mock.callCount(), 0);
      assert.equal(mocks.save.mock.callCount(), 0);
    });
  }
}

for (const method of ['PUT', 'DELETE']) {
  test(`${method} denies a different Firebase user despite owner IDs in the body`, async t => {
    const mocks = mockBoundaries(t, 'other-user');
    const recipe = makeRecipe();
    const original = recipe.toObject();
    mocks.find.mock.mockImplementation(async () => recipe);

    const response = await api.request(method, `/${recipeId}`, { authorization, body: updateBody });

    assert.equal(response.status, 403);
    assert.equal(response.body.success, false);
    assert.match(response.body.message, /Not authorized/);
    assert.deepEqual(mocks.find.mock.calls[0].arguments, [recipeId]);
    assert.deepEqual(recipe.toObject(), original);
    assert.equal(mocks.save.mock.callCount(), 0);
    assert.equal(mocks.remove.mock.callCount(), 0);
  });
}

test('DELETE lets the verified owner remove exactly the requested recipe', async t => {
  const mocks = mockBoundaries(t);
  mocks.find.mock.mockImplementation(async () => makeRecipe());

  const response = await api.request('DELETE', `/${recipeId}`, { authorization });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.deepEqual(mocks.verify.mock.calls[0].arguments, ['verified-token']);
  assert.equal(mocks.find.mock.callCount(), 1);
  assert.deepEqual(mocks.find.mock.calls[0].arguments, [recipeId]);
  assert.equal(mocks.remove.mock.callCount(), 1);
  assert.deepEqual(mocks.remove.mock.calls[0].arguments, [recipeId]);
  assert.equal(mocks.save.mock.callCount(), 0);
});

for (const missing of [true, false]) {
  test(`DELETE returns 404 without writing for a ${missing ? 'missing' : 'malformed'} recipe ID`, async t => {
    const mocks = mockBoundaries(t);
    const id = missing ? recipeId : 'not-an-object-id';
    if (!missing) {
      mocks.find.mock.mockImplementation(async () => {
        throw new Recipe.db.base.Error.CastError('ObjectId', id, '_id');
      });
      t.mock.method(console, 'error', () => {});
    }

    const response = await api.request('DELETE', `/${id}`, { authorization });

    assert.equal(response.status, 404);
    assert.equal(response.body.success, false);
    assert.match(response.body.message, /Recipe not found/);
    assert.deepEqual(mocks.find.mock.calls[0].arguments, [id]);
    assert.equal(mocks.remove.mock.callCount(), 0);
    assert.equal(mocks.save.mock.callCount(), 0);
  });
}

test('the owner cannot like their own recipe', async t => {
  const mocks = mockBoundaries(t);
  const recipe = makeRecipe();
  mocks.find.mock.mockImplementation(async () => recipe);

  const response = await api.request('POST', `/${recipeId}/like`, { authorization });

  assert.equal(response.status, 403);
  assert.equal(response.body.success, false);
  assert.equal(recipe.likeCount, 5);
  assert.equal(mocks.save.mock.callCount(), 0);
});

test('a verified non-owner can like a recipe without changing its ownership', async t => {
  const mocks = mockBoundaries(t, 'other-user');
  const recipe = makeRecipe();
  mocks.find.mock.mockImplementation(async () => recipe);

  const response = await api.request('POST', `/${recipeId}/like`, { authorization });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.likeCount, 6);
  assert.equal(response.body.data.addedBy.userId, 'owner');
  assert.equal(recipe.likeCount, 6);
  assert.equal(mocks.save.mock.callCount(), 1);
  assert.equal(mocks.save.mock.calls[0].this, recipe);
});

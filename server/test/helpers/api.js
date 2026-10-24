const { once } = require('node:events');
const express = require('express');
const errorHandler = require('../../middleware/errorHandler');

exports.startApi = async (path, router) => {
  // Mount real routes without app.js's database connection and credential setup.
  const app = express();
  app.use(express.json());
  app.use(path, router);
  app.use(errorHandler);

  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const baseUrl = `http://127.0.0.1:${server.address().port}${path}`;

  return {
    async request(method, path, { authorization, body } = {}) {
      const headers = { 'Content-Type': 'application/json', Connection: 'close' };
      if (authorization !== undefined) headers.Authorization = authorization;
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      });
      return { status: response.status, body: await response.json() };
    },
    close() {
      return new Promise((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
      });
    },
  };
};

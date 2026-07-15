import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

// Template: cover the success path, a 400 (validation), and a 404 (not found).
describe('GET /<resource>/:id', () => {
  it('returns 200 with a { data } envelope for a valid id', async () => {
    const res = await request(app).get('/<resource>/<known-id>');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(app).get('/<resource>/does-not-exist');
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid input', async () => {
    const res = await request(app).get('/<resource>/%20');
    expect(res.status).toBe(400);
  });
});

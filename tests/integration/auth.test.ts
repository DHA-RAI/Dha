import request from 'supertest';
import { app } from '../../server';
import jwt from 'jsonwebtoken';

describe('Authentication Tests', () => {
  it('should validate JWT tokens', async () => {
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET!);
    const res = await request(app)
      .get('/api/documents')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
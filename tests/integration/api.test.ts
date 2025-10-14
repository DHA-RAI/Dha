import request from 'supertest';
import { app } from '../../server';

describe('API Integration Tests', () => {
  it('should return health check', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});
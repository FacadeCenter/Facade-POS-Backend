import request from 'supertest';
import app from '../app';
import prisma from '../config/db';

describe('Backend Integration Tests', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should return health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('should login successfully with seeded credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@demo.com', password: 'password123' });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.role).toBe('TENANT_ADMIN');
  });

  it('should fail login with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@demo.com', password: 'wrongpassword' });
    
    expect(res.status).toBe(401);
  });

  it('should protect sales endpoints', async () => {
    const res = await request(app).get('/api/v1/sales');
    expect(res.status).toBe(401);
  });
});

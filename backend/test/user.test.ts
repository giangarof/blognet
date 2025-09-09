import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import request from 'supertest';
import app from '../../index.js';
import bcrypt from 'bcrypt';
import * as tokenModule from '../config/generateToken.js';
import pool from '../config/dbConfig.js';

// Setup mocks
vi.mock('../config/generateToken.js');
(tokenModule.generateToken as Mock) = vi.fn();

vi.mock('../config/dbConfig.js');
const mockQuery = pool.query as unknown as Mock;

const testUser = {
  id: 1,
  firstname: 'John',
  lastname: 'Doe',
  email: 'john@example.com',
  username: 'johndoe',
  password: '$2b$10$hashedpassword', // bcrypt hash
  is_admin: false
};

describe('User API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------- Login tests ----------------
  it('should return 400 if email or password missing', async () => {
    const res = await request(app).post('/api/user/login').send({ email: '' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Email and password are required');
  });

  it('should return 401 if user not found', async () => {
    mockQuery.mockResolvedValue({ rows: [] });
    const res = await request(app).post('/api/user/login').send({
      email: 'missing@example.com',
      password: 'Password123!'
    });
    expect(res.status).toBe(401);
  });

  it('should return 200 and call generateToken if login succeeds', async () => {
    mockQuery.mockResolvedValue({ rows: [testUser] });
    vi.spyOn(bcrypt, 'compare').mockImplementationOnce(() => Promise.resolve(true));

    const res = await request(app).post('/api/user/login').send({
      email: 'john@example.com',
      password: 'Password123!'
    });

    expect(res.status).toBe(200);
    expect(tokenModule.generateToken).toHaveBeenCalledWith(expect.anything(), testUser);
  });

  // ---------------- Signup tests ----------------
  it('should create a new user successfully', async () => {
    const newUser = { firstname: 'Alice', lastname: 'Smith', email: 'alice@test.com', password: 'Password123!', username: 'alice' };
    mockQuery.mockResolvedValue({ rows: [{ id: 2, ...newUser, is_admin: false }] });

    const res = await request(app).post('/api/user/').send(newUser);
    // console.log(res.status, res.body);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id', 2);
  });

  // ---------------- Logout tests ----------------
  it('should clear cookies on logout', async () => {
    const res = await request(app).post('/api/user/logout');
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
  });
});

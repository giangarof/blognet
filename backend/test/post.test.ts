import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../index.js';
import pool from '../config/dbConfig.js';
import * as tokenModule from '../config/generateToken.js';

// Mock DB
vi.mock('../config/generateToken.js');
import type { Mock } from 'vitest';
(tokenModule.generateToken as Mock) = vi.fn();

vi.mock('../config/dbConfig.js');
const mockQuery = pool.query as unknown as Mock;

// Fake user + post
const testUser = { id: 1, username: 'johndoe', is_admin: false };
const testPost = {
  id: 10,
  title: 'Test Post',
  content: 'Hello World!',
  createdby: testUser.id,
  image: null,
  created_at: new Date(),
  updated_at: new Date(),
};

describe('Post API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a post successfully', async () => {
    // mock DB insert
    mockQuery.mockResolvedValueOnce({ rows: [testPost] });

    const res = await request(app)
      .post('/api/post') // <-- check your route prefix
      .set('Authorization', 'Bearer faketoken')
      .send({ title: 'Test Post', content: 'Hello World!' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('post');
    expect(res.body.post.title).toBe('Test Post');
  });

  it('should return 400 if title or content missing', async () => {
    const res = await request(app)
      .post('/api/post')
      .set('Authorization', 'Bearer faketoken')
      .send({ title: '' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Title and content are required');
  });

  it('should fetch all posts', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [testPost] });

    const res = await request(app).get('/api/post');
    expect(res.status).toBe(200);
    expect(res.body[0].title).toBe('Test Post');
  });

  it('should fetch a post by id', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [testPost], rowCount: 1 });

    const res = await request(app).get(`/api/post/${testPost.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', testPost.id);
  });
});


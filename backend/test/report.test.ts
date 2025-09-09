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

// Fake data
const fakePosts = [
  {
    id: 1,
    title: 'Post 1',
    content: 'Hello World',
    likes_count: 3,
    created_at: '2025-09-01T12:00:00.000Z',
    user_id: 1,
    firstname: 'John',
    lastname: 'Doe',
  },
];

const fakeComments = [
  {
    id: 101,
    post_id: 1,
    content: 'Nice post!',
    likes_count: 2,
    created_at: '2025-09-02T12:00:00.000Z',
    user_id: 2,
    firstname: 'Alice',
    lastname: 'Smith',
  },
];

describe('Report API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retrieve posts and comments within date range', async () => {
    // Mock DB queries
    mockQuery.mockResolvedValueOnce({ rows: fakePosts });    // posts query
    mockQuery.mockResolvedValueOnce({ rows: fakeComments }); // comments query

    const res = await request(app).get('/api/report')
      .query({ startDate: '2025-09-01', endDate: '2025-09-30' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('posts');
    expect(res.body).toHaveProperty('comments');

    expect(res.body.posts).toHaveLength(1);
    expect(res.body.posts[0].title).toBe('Post 1');

    expect(res.body.comments).toHaveLength(1);
    expect(res.body.comments[0].content).toBe('Nice post!');
  });

  it('should handle server errors', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/report')
      .query({ startDate: '2025-09-01', endDate: '2025-09-30' });

    expect(res.status).toBe(500);
    expect(res.text).toBe('Server error');
  });
});

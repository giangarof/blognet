import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../index.js';
import pool from '../config/dbConfig.js';
import * as tokenModule from '../config/generateToken.js';


// ------------------ Mock DB ------------------
vi.mock('../config/generateToken.js');
import type { Mock } from 'vitest';
(tokenModule.generateToken as Mock) = vi.fn();

vi.mock('../config/dbConfig.js');
const mockQuery = pool.query as unknown as Mock;

// ------------------ Fake data ------------------
const testUser = { id: 1, username: 'johndoe', is_admin: false };
const testPost = { id: 10, title: 'Test Post', content: 'Hello World!', createdby: testUser.id };
const testComment = { id: 100, content: 'First comment', post_id: testPost.id, createdby: testUser.id };

let postId: number;
let commentId: number;
const fakeToken = 'Bearer faketoken';

describe('Comment API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a post for testing comments', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [testPost] });

    const resPost = await request(app)
      .post('/api/post')
      .set('Authorization', fakeToken)
      .send({ title: 'Test Post', content: 'Hello World!' });

    postId = resPost.body.post.id;
    expect(resPost.status).toBe(201);
    expect(postId).toBeDefined();
  });

  it('should create a comment', async () => {
    // Mock DB insert to return the comment
    mockQuery.mockResolvedValueOnce({ rows: [testComment] });

    const res = await request(app)
      .post(`/api/comment/${postId}`)
      .set('Authorization', fakeToken)
      .send({ content: 'First comment' });

    // Now we have an actual comment returned from DB mock
    commentId = res.body.comment?.id ?? testComment.id; 
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'Comment created successfully');
  });

  it('should update a comment', async () => {
    // Mock DB update to return the updated comment
    mockQuery.mockResolvedValueOnce({ rows: [{ ...testComment, content: 'Updated comment' }] });

    const res = await request(app)
      .put(`/api/comment/${commentId}`)
      .set('Authorization', fakeToken)
      .send({ content: 'Updated comment' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Comment updated successfully');
  });

  it('should delete a comment', async () => {
    // Mock DB delete returning rowCount 1
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const res = await request(app)
      .delete(`/api/comment/${commentId}`)
      .set('Authorization', fakeToken);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Comment deleted successfully');
  });
});


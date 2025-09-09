// routes/comments.ts
import express from 'express';
import {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
  toggleCommentLike
} from '../controllers/comments.js';
import { protect, adminOrOwnerComment } from '../middleware/auth.js';


const router = express.Router();

router.post('/:postId', protect, createComment);
router.post('/like/:commentId', protect, toggleCommentLike);
router.get('/:postId', getCommentsByPost);
router.put('/:id', protect, adminOrOwnerComment, updateComment);
router.delete('/:id', protect, adminOrOwnerComment, deleteComment);

export default router;

import { Router } from "express";
import { createPost, deletePost, getAllPosts, getAllPostsByUser, getPostById, toggleLikePost, updatePost } from "../controllers/posts.js";
import {protect, admin, adminOrOwnerPost} from '../middleware/auth.js'

const router = Router();

router.get("/", getAllPosts);                                           // Create Post
router.get("/all/:id", getAllPostsByUser);                              // Get all posts thta belong to this user, by id
router.get('/:id', getPostById)                                         // Get Post by ID
router.post("/", protect, createPost);                                  // Create Post
router.post("/like/:id", protect, toggleLikePost);                      // Like or unlike Post
router.put("/:id", protect, adminOrOwnerPost, updatePost);              // Update Post
router.delete("/delete/:id", protect, adminOrOwnerPost, deletePost);    // Delete Post


export default router;
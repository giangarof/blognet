import { type Request, type Response } from "express";
import pool from "../config/dbConfig.js";
import { PostWithImage } from "../models/PostWithImage.js";
import { Post } from "../models/Post.js";

export const getAllPosts = async(req:Request, res:Response) => {
    try {
    const result = await pool.query(
      `SELECT p.*, u.username AS author 
       FROM posts p
       JOIN users u ON p.createdBy = u.id
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const getPostById = async(req:Request, res:Response) => {
    try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.*, u.username AS author 
       FROM posts p
       JOIN users u ON p.createdBy = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const getAllPostsByUser = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id!);

  try {
    const result = await pool.query(
      "SELECT * FROM posts WHERE createdby = $1 ORDER BY created_at DESC",
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching posts by user:", error);
    res.status(500).json({ error: "Server error" });
  }
};


export const createPost = async (req:Request, res:Response) => {
    try {
    const { title, content } = req.body;
    const image = req.body.image || null; // image can be optional
    const createdBy = req.user?.user; // protect middleware must set req.user

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    let newPost: Post | PostWithImage;

    if (image) {
      // Use inherited class if image is provided
      newPost = new PostWithImage(0, title, content, createdBy, image);
    } else {
      newPost = new Post(0, title, content, createdBy);
    }

    // Insert into DB
    const result = await pool.query(
      `INSERT INTO posts (title, content, image, createdBy)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, content, image, createdBy, created_at, updated_at`,
      [newPost.title, newPost.content, image, createdBy]
    );

    res.status(201).json({
      message: "Post created successfully",
      post: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: error });
  }
}

export const updatePost = async(req:Request, res:Response) => {
    try {
    const { id } = req.params;
    const { title, image, content } = req.body;

    const requester = req.user;
    if (!requester) {
      return res.status(401).json({ error: "Not authorized" });
    }

    // Get the post
    const postResult = await pool.query(`SELECT * FROM posts WHERE id = $1`, [id]);
    if (postResult.rowCount === 0) {
      return res.status(404).json({ error: "Post not found" });
    }
    const post = postResult.rows[0];

    // Only admin or owner can update
    if (!requester.is_admin && requester.user !== post.createdby) {
      return res.status(403).json({ error: "Not authorized to update this post" });
    }

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (title) { fields.push(`title = $${idx}`); values.push(title); idx++; }
    if (image) { fields.push(`image = $${idx}`); values.push(image); idx++; }
    if (content) { fields.push(`content = $${idx}`); values.push(content); idx++; }

    if (fields.length === 0) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    values.push(id);
    const query = `UPDATE posts SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${idx} RETURNING *`;

    const updateResult = await pool.query(query, values);
    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const deletePost = async(req:Request, res:Response) => {
    try {
    const postId = parseInt(req.params.id!);
    const requester = req.user; // set by protect middleware

    if (!requester) {
      return res.status(401).json({ error: "Not authorized" });
    }

    // Fetch the post to check ownership
    const { rows } = await pool.query("SELECT * FROM posts WHERE id = $1", [postId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    const post = rows[0];

    // Authorization: only admin or owner can delete
    if (!requester.is_admin && post.createdby !== requester.user) {
      return res.status(403).json({ error: "Only admins or the post owner can delete this post" });
    }

    // Delete the post
    await pool.query("DELETE FROM posts WHERE id = $1", [postId]);

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error });
  }
}

export const toggleLikePost = async (req: Request, res: Response) => {
  const { id: postId } = req.params;
  const userId = req.user.user; // from auth middleware

  try {
    // Check if post exists
    const postResult = await pool.query("SELECT likes FROM posts WHERE id = $1", [postId]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const currentLikes: number[] = postResult.rows[0].likes || [];
    let updatedLikes: number[];

    if (currentLikes.includes(userId)) {
      // Unlike → remove userId
      updatedLikes = currentLikes.filter((id) => id !== userId);
    } else {
      // Like → add userId
      updatedLikes = [...currentLikes, userId];
    }

    // Update in DB
    await pool.query("UPDATE posts SET likes = $1, updated_at = NOW() WHERE id = $2", [
      updatedLikes,
      postId,
    ]);

    res.json({
      message: currentLikes.includes(userId) ? "Unliked post" : "Liked post",
      likes: updatedLikes.length,
    });
  } catch (error: any) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Error toggling like", error: error.message });
  }
};
import { type Request, type Response } from "express";
import pool from "../config/dbConfig.js";

// CREATE COMMENT
export const createComment = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.user.user; // from protect middleware

  try {
    const postExists = await pool.query("SELECT id, createdBy FROM posts WHERE id = $1", [postId]);
    if (postExists.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const result = await pool.query(
      "INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *",
      [postId, userId, content]
    );

    res.status(201).json({ message: "Comment created", comment: result.rows[0] });
  } catch (error: any) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Error creating comment", error: error.message });
  }
};

// DELETE COMMENT
export const deleteComment = async (req: Request, res: Response) => {
  const { id } = req.params; // comment id
  const requester = req.user;

  try {
    const commentResult = await pool.query(
      "SELECT * FROM comments WHERE id = $1",
      [id]
    );

    if (commentResult.rows.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const comment = commentResult.rows[0];

    const postResult = await pool.query(
      "SELECT createdBy FROM posts WHERE id = $1",
      [comment.post_id]
    );

    const postOwner = postResult.rows[0].createdby;

    // Authorization: admin, comment owner, or post owner
    if (!requester.is_admin && requester.user !== comment.user_id && requester.user !== postOwner) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await pool.query("DELETE FROM comments WHERE id = $1", [id]);

    res.json({ message: "Comment deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Error deleting comment", error: error.message });
  }
};

// GET COMMENTS FOR A POST
// GET /api/comment/:postId
export const getCommentsByPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const { rows } = await pool.query(
      `
      SELECT c.id, c.content, c.user_id, c.likes, c.created_at,
             u.firstname, u.lastname, u.username
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
      `,
      [postId]
    );

    // Normalize likes to number[] and add likesCount
    const comments = rows.map((c) => ({
      ...c,
      likes: (c.likes || []).map(Number),
      likesCount: (c.likes || []).length,
    }));

    res.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Server error" });
  }
};


// UPDATE COMMENT
export const updateComment = async (req: Request, res: Response) => {
  const { id } = req.params; // comment id
  const { content } = req.body;
  const requester = req.user;

  try {
    const commentResult = await pool.query(
      "SELECT * FROM comments WHERE id = $1",
      [id]
    );

    if (commentResult.rows.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const comment = commentResult.rows[0];

    // Get post owner
    const postResult = await pool.query(
      "SELECT createdBy FROM posts WHERE id = $1",
      [comment.post_id]
    );
    const postOwner = postResult.rows[0].createdby;

    // Authorization: admin, comment owner, or post owner
    if (!requester.is_admin && requester.user !== comment.user_id && requester.user !== postOwner) {
      return res.status(403).json({ message: "Not authorized to update this comment" });
    }

    // Update content
    const updatedResult = await pool.query(
      "UPDATE comments SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [content, id]
    );

    res.json({ message: "Comment updated", comment: updatedResult.rows[0] });
  } catch (error: any) {
    console.error("Error updating comment:", error);
    res.status(500).json({ message: "Error updating comment", error: error.message });
  }
};

// Like/unlike a comment
// POST /api/comment/like/:commentId
export const toggleCommentLike = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = Number(req.user?.user);

    // Fetch current likes
    const { rows } = await pool.query(
      `SELECT likes, user_id, content, created_at FROM comments WHERE id = $1`,
      [commentId]
    );
    if (!rows.length) return res.status(404).json({ error: "Comment not found" });

    let likes: number[] = (rows[0].likes || []).map(Number);

    if (likes.includes(userId)) {
      likes = likes.filter((id) => id !== userId); // unlike
    } else {
      likes.push(userId); // like
    }

    // Update comment
    await pool.query(`UPDATE comments SET likes = $1 WHERE id = $2`, [likes, commentId]);

    // Return full updated comment with user info
    const { rows: updatedRows } = await pool.query(
      `
      SELECT c.id, c.content, c.user_id, c.likes, c.created_at,
             u.firstname, u.lastname, u.username
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.id = $1
      `,
      [commentId]
    );

    const updatedComment = updatedRows[0];
    updatedComment.likes = (updatedComment.likes || []).map(Number);
    updatedComment.likesCount = updatedComment.likes.length;

    res.json({ comment: updatedComment });
  } catch (error) {
    console.error("Error toggling comment like:", error);
    res.status(500).json({ error: "Server error" });
  }
};






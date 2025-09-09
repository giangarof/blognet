import { type Request, type Response } from "express";
import pool from "../config/dbConfig.js"; // your PostgreSQL pool

export const getReports = async(req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    
    try {
      const postsQuery = `
        SELECT 
          p.id, p.title, p.content, array_length(p.likes, 1) AS likes_count,
          p.created_at, u.id AS user_id, u.firstname, u.lastname
        FROM posts p
        JOIN users u ON p.createdBy = u.id
        WHERE p.created_at BETWEEN $1 AND $2
        ORDER BY p.created_at ASC
      `;
      
      const commentsQuery = `
        SELECT 
          c.id, c.post_id, c.content, array_length(c.likes,1) AS likes_count,
          c.created_at, u.id AS user_id, u.firstname, u.lastname
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.created_at BETWEEN $1 AND $2
        ORDER BY c.created_at ASC
      `;
    
      const postsResult = await pool.query(postsQuery, [startDate, endDate]);
      const commentsResult = await pool.query(commentsQuery, [startDate, endDate]);
    
      res.json({
        posts: postsResult.rows,
        comments: commentsResult.rows,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }

}

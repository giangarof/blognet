import { type Response, type Request } from 'express';
import pool from "../config/dbConfig.js";

// Method= GET
// description= search bar functionality
export const genericSearch = async (req: Request, res: Response) => {
  try {
    const { type, query } = req.query;

    if (!type || !query || typeof type !== "string" || typeof query !== "string") {
      return res.json([]);
    }

    let sql = "";
    let values: any[] = [`%${query}%`];

    switch (type.toLowerCase()) {
      case "users":
        sql = `
          SELECT id, firstname, lastname, username, email, is_admin
          FROM users
          WHERE firstname ILIKE $1
             OR lastname ILIKE $1
             OR username ILIKE $1
             OR email ILIKE $1
        `;
        break;
      case "posts":
        sql = `
          SELECT p.id, p.title, p.content, p.created_at, u.username AS author, p.image
          FROM posts p
          JOIN users u ON p.createdBy = u.id
          WHERE p.title ILIKE $1
             OR p.content ILIKE $1
             OR u.username ILIKE $1
        `;
        break;
      default:
        return res.json([]);
    }

    const result = await pool.query(sql, values);

    if (result.rows.length === 0) {
      return res.json([]);
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};
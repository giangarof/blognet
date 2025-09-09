import express, {type Express, type Response, type Request, type NextFunction} from 'express'
import jwt from "jsonwebtoken";
import pool from "../config/dbConfig.js"; // your PostgreSQL pool

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Description = Middleware to protect routes
// Explanation = If the users doesn't have a JWT cookie, it won't to specific task like:
//               creating a post, comment a post, or other privileges. 
// For the middleware application, go to 'routes/user.ts'
export const protect = (req: Request, res: Response, next: NextFunction) => {
  
  try {

    const token = req.cookies.jwt; // read JWT from cookie

    if (!token) {
      return res.status(401).json({ error: "Not authorized, no token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded; // attach decoded user info to request
    console.log('decoded', decoded)

    next();
  } catch (error) {
    console.error("JWT error:", error);
    res.status(401).json({ error: "Not authorized, invalid token" });
  }
};

// Description = Middleware to restrict routes to admins
// Explanation = 
export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.is_admin) {
    console.log(req.user)
    next();
  } else {
    
    res.status(403).json({ error: "Admin access only", user: req.user });
  }
};


// Admin-or-owner middleware
// Explanation = If the user isn't admin or owner, it won't be able to do admins operations like:
//               deleting / updating users accounts, deleting comments that are out of topic to the company, download reports, 
export const adminOrOwnerUser = (req: Request, res: Response, next: NextFunction) => {
  const requester = req.user;
  const targetId = parseInt(req.params.id!);
  // console.log(targetId, requester)

  if (!requester) return res.status(401).json({ error: "Not authorized" });

  if (requester.is_admin || requester.user === targetId) {
    return next(); // allowed
  }

  res.status(403).json({ error: "Only admins or the owner can perform this action" });
};

export const adminOrOwnerPost = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const requester = req.user; // set by protect middleware
    const postId = parseInt(req.params.id!);

    if (!requester) {
      return res.status(401).json({ error: "Not authorized" });
    }

    // Admin can always proceed
    if (requester.is_admin) {
      return next();
    }

    // Check post owner in DB
    const result = await pool.query("SELECT createdBy FROM posts WHERE id = $1", [postId]);
    console.log('requester',requester)

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    const post = result.rows[0];

    if (post.createdby !== requester.user) {
      console.log(typeof(post.createdby),typeof(requester.user))
      return res.status(403).json({ error: "You can only modify your own posts" });
    }

    next();
  } catch (error) {
    console.error("Error in adminOrOwnerPost middleware:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const adminOrOwnerComment = async (req: Request, res: Response, next: NextFunction) => {
  const commentId = parseInt(req.params.id!);
  const userId = req.user.user; // from protect middleware

  try {
    const result = await pool.query(
      `SELECT c.user_id AS commentOwner, p.createdBy AS postOwner 
       FROM comments c
       JOIN posts p ON c.post_id = p.id
       WHERE c.id = $1`,
      [commentId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const { commentowner, postowner } = result.rows[0];

    if (req.user.is_admin || commentowner === userId || postowner === userId) {
      next();
    } else {
      res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
  } catch (error: any) {
    console.error('AdminOrOwnerComment middleware error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
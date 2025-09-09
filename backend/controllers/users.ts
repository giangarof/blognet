import express, {type Express, type Response, type Request} from 'express'
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { generateToken } from '../config/generateToken.js';
import { AdminUser } from '../models/AdminUser.js';

// Models
// OOP principles
import { User } from "../models/User.js";

//import the postgreSQL pool
import pool from "../config/dbConfig.js";

// Description: get all users
export const getAllUsers = async (req:Request, res: Response) => {
    try {
        const result = await pool.query(
            "SELECT * FROM users order by id"
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching users");
        res.status(500).json({ error: "Database error" });
    }
}

// Description: get user by ID
export const getUserByID = async (req:Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "SELECT * FROM users WHERE id = $1",
        [id]
        );

        if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: error });
    }
}

// Description: SIGNUP user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstname, lastname, username, email, password, is_admin } = req.body;

    if (!firstname || !lastname || !username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create correct user type
    const userObj = is_admin ? 
      new AdminUser(firstname, lastname, username, email, hashedPassword) :
      new User(firstname, lastname, username, email, hashedPassword);

    const result = await pool.query(
      `INSERT INTO users (firstname, lastname, username, email, password, is_admin)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, firstname, lastname, username, email, is_admin`,
      [userObj.firstname, userObj.lastname, userObj.username, userObj.email, hashedPassword, userObj.is_admin]
    );

    // Attach DB id to object
    userObj.id = result.rows[0].id;

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ "error": error });
  }
};

// Description: delete user by id
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0), // set expiration in the past
  });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: error });
  }
};

// Description: update user by ID
export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);
    const { firstname, lastname, username, email, password, is_admin } = req.body;

    // Check if at least one field is provided
    if (!firstname && !lastname && !username && !email && !password && is_admin === undefined) {
      return res.status(400).json({ error: "At least one field must be provided to update" });
    }

    // Password length check
    if (password && password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    // Build dynamic query
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (firstname) { fields.push(`firstname = $${idx}`); values.push(firstname); idx++; }
    if (lastname)  { fields.push(`lastname = $${idx}`); values.push(lastname); idx++; }
    if (username)  { fields.push(`username = $${idx}`); values.push(username); idx++; }
    if (email)     { fields.push(`email = $${idx}`); values.push(email); idx++; }
    if (password)  { 
        const hashedPassword = await bcrypt.hash(password, 10);
        fields.push(`password = $${idx}`); values.push(hashedPassword); idx++; 
    }
    if (is_admin !== undefined) { 
      fields.push(`is_admin = $${idx}`); values.push(is_admin); idx++; 
    }

    const query = `UPDATE users SET ${fields.join(", ")} WHERE id = $${idx} RETURNING id, firstname, lastname, username, email, is_admin`;
    values.push(id);

    const result = await pool.query(query, values);

    if (result.rowCount === 0) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User updated successfully", user: result.rows[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error });
  }
};

// Description: update user to admin
export const promoteToAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // the user to promote
    const requester = req.user; // set by protect middleware

    // Only admins can promote
    if (!requester?.is_admin) {
      return res.status(403).json({ error: "Admin access only" });
    }

    const query = `
      UPDATE users 
      SET is_admin = TRUE
      WHERE id = $1
      RETURNING id, firstname, lastname, username, email, is_admin
    `;
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: `User ${result.rows[0].username} has been promoted to admin`,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error promoting user:", error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
}


// Description: login user with token
export const login = async(req: Request, res: Response) => {
    try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // check if user exists
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "No user found" });
    }

    // check password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // generate token cookie from '../config/generateToken.js'
    generateToken(res, user);

    res.status(200).json({
      message: "Login successful",
      user:user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error });
  }

}

// Description: logout user and remove token
export const logout = async(req: Request, res: Response) => {
    res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0), // set expiration in the past
  });

  res.status(200).json({ message: "Logged out successfully" });

}


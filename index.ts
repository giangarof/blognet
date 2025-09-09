import dotenv from "dotenv";
dotenv.config(); // load .env variables

import express, { type Express } from 'express';
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// routes
import router_user from './backend/routes/users.js';
import router_post from './backend/routes/posts.js';
import router_comments from './backend/routes/comments.js';
import router_searchbar from './backend/routes/search.js';
import router_report from "./backend/routes/report.js";

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Parse incoming JSON
app.use(express.json());

// Parse cookies
app.use(cookieParser());


// Parse urlencoded (x-www-form-urlencoded & form-data)
app.use(express.urlencoded({ extended: true }));

// Use API routes
app.use('/api/comment', router_comments);
app.use('/api/user', router_user);
app.use('/api/post', router_post);
app.use('/api/search', router_searchbar);
app.use('/api/report', router_report);

// SPA fallback — any route not starting with /api goes to frontend
// SPA fallback for frontend — must come after all API routes
app.use((req, res, next) => {
  // If the request starts with /api, skip to next route
  if (req.path.startsWith('/api')) return next();

  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;

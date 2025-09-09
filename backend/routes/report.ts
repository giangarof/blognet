import { Router } from "express";
import { getReports } from "../controllers/reports.js";
import {protect, admin, } from '../middleware/auth.js'

const router = Router();

router.get("/", protect, admin, getReports);  

export default router;
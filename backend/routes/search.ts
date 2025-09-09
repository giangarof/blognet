import { Router } from "express";
import { genericSearch } from "../controllers/searchBar.js";

const router = Router();

router.get("/", genericSearch);

export default router;

import { Router } from "express";
import { getAllUsers, getUserByID, createUser, deleteUser, updateUser, login, logout, promoteToAdmin} from "../controllers/users.js";
import {protect, admin, adminOrOwnerUser} from '../middleware/auth.js'

const router = Router();

router.get("/", protect, getAllUsers);                                      // GET all users
router.get("/:id", getUserByID);                                            // GET user by ID
router.post("/", createUser);                                               // CREATE user
router.put('/:id', protect, adminOrOwnerUser, updateUser);                  // UPDATE USER
router.put('/promote/:id', protect, admin, promoteToAdmin);                 // Update User to admin
router.delete("/delete/:id", protect, adminOrOwnerUser, deleteUser);        // DELETE user
router.post("/login", login);                                               // LOGIN user
router.post("/logout", logout);                                             // LOGIN user

export default router;
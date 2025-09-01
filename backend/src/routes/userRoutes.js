import express from "express";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { getMe } from "../controllers/userController.js";

const router = express.Router();
router.get("/me", requireAuth, getMe);
export default router;

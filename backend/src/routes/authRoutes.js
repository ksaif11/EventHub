import express from "express";
import { requestOtp, verifyOtp, login } from "../controllers/authController.js";
const router = express.Router();

router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);

export default router;

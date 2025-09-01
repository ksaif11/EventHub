import express from "express";
import { requireAuth } from "../middlewares/authMiddleware.js";
import {
  validateAttendance,
  validateToken,
  submitFeedback,
  submitFeedbackWithToken,
  generateFeedbackTokens,
  sendFeedbackEmails
} from "../controllers/feedbackController.js";

const router = express.Router();

router.get("/:eventId/validate-attendance", requireAuth, validateAttendance);
router.post("/validate-token", requireAuth, validateToken);
router.post("/submit", requireAuth, submitFeedback);
router.post("/submit-with-token", requireAuth, submitFeedbackWithToken);
router.post("/:eventId/generate-tokens", requireAuth, generateFeedbackTokens);
router.post("/:eventId/send-emails", requireAuth, sendFeedbackEmails);

export default router;

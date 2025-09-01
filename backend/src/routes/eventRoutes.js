import express from "express";
import {
  listEvents,
  getEvent,
  createEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  listAttendees,
} from "../controllers/eventController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", listEvents);
router.get("/:id", getEvent);

router.post("/", requireAuth, createEvent);
router.delete("/:id", requireAuth, deleteEvent);

router.post("/:id/join", requireAuth, joinEvent);
router.delete("/:id/leave", requireAuth, leaveEvent);

router.get("/:id/attendees", requireAuth, listAttendees);

export default router;

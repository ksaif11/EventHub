import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js"
import eventRoutes from "./routes/eventRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import feedbackRoutes from "./routes/feedbackRoutes.js"
import { optionalAuth } from "./middlewares/optionalAuth.js";

dotenv.config();
const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

app.use(optionalAuth);

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/feedback", feedbackRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Socio-Gather API is running" });
});

app.use(errorHandler);

export default app;

import jwt from "jsonwebtoken";
import createError from "http-errors";
import User from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw createError(401, "Authentication required");

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).lean();
    if (!user) throw createError(401, "Invalid token");

    req.user = { id: user._id.toString(), email: user.email, name: user.name };
    next();
  } catch (err) {
    next(createError(err.status || 401, err.message || "Unauthorized"));
  }
};

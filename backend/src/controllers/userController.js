import createError from "http-errors";
import User from "../models/User.js";
import Event from "../models/Event.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { cacheGet, cacheSet, generateCacheKey } from '../services/cacheService.js';

export const getMe = asyncHandler(async (req, res) => {
  const cacheKey = generateCacheKey('user:dashboard', {
    userId: req.user.id
  });

  const cached = await cacheGet(cacheKey);
  if (cached) {
    console.log(` Cache HIT: ${cacheKey}`);
    return ok(res, cached);
  }

  console.log(`Cache MISS: ${cacheKey}`);

  const user = await User.findById(req.user.id).select("_id name email joinedEvents createdEvents").lean();
  if (!user) throw createError(404, "User not found");

  const [created, joined] = await Promise.all([
    Event.find({ _id: { $in: user.createdEvents || [] } })
      .select("_id title description date location tags category duration entryFee attendeeCount")
      .lean(),
    Event.find({ _id: { $in: user.joinedEvents || [] } })
      .select("_id title description date location tags category duration entryFee attendeeCount")
      .lean(),
  ]);

  const result = { 
    user: { _id: user._id, name: user.name, email: user.email }, 
    createdEvents: created, 
    joinedEvents: joined 
  };

  await cacheSet(cacheKey, result, 900);

  return ok(res, result);
});

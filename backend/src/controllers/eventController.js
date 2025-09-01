import createError from "http-errors";
import mongoose from "mongoose";
import Event from "../models/Event.js";
import User from "../models/User.js";
import Feedback from "../models/Feedback.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  validateObjectId,
  validateCreateEvent,
  normalizeTags,
  parsePagination,
  parseSort,
  parseTags,
} from "../utils/validators.js";
import { ok } from "../utils/apiResponse.js";
import { cacheGet, cacheSet, cacheInvalidatePattern, generateCacheKey } from '../services/cacheService.js';

export const listEvents = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const tags = parseTags(req.query.tags);
  const sort = parseSort(req.query.sort);
  const { page, limit, skip } = parsePagination(req.query);

  const cacheKey = generateCacheKey('events:list', {
    search: search || '',
    tags: tags.join(','),
    sort: JSON.stringify(sort),
    page,
    limit,
    skip
  });

  const cached = await cacheGet(cacheKey);
  if (cached) {
    console.log(` Cache HIT: ${cacheKey}`);
    return ok(res, cached);
  }

  console.log(`❌ Cache MISS: ${cacheKey}`);

  const filter = { date: { $gte: new Date() } };

  if (search && search.trim()) {
    filter.$text = { $search: search.trim() };
  }
  if (tags.length) {
    filter.tags = { $all: tags };
  }

  const [items, total] = await Promise.all([
    Event.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("title date location.formattedAddress tags attendeeCount organizerId")
      .lean(),
    Event.countDocuments(filter),
  ]);

  const result = { events: items, total, page, limit };
  
  await cacheSet(cacheKey, result, 300);

  return ok(res, result);
});

export const getEvent = asyncHandler(async (req, res) => {
  const err = validateObjectId(req.params.id, "eventId");
  if (err) throw createError(400, err);

  const cacheKey = generateCacheKey('event:details', {
    eventId: req.params.id,
    userId: req.user?.id || 'anonymous'
  });

  const cached = await cacheGet(cacheKey);
  if (cached) {
    console.log(` Cache HIT: ${cacheKey}`);
    return ok(res, cached);
  }

  console.log(`❌ Cache MISS: ${cacheKey}`);

  const event = await Event.findById(req.params.id).lean();
  if (!event) throw createError(404, "Event not found");

  let joined = false;
  if (req.user?.id) {
    joined = !!event.attendees?.some((u) => u.toString() === req.user.id);
  }

  const feedbacks = await Feedback.find({ eventId: event._id })
    .select('hostRating eventRating eventExperience attendeeName submittedAt')
    .sort({ submittedAt: -1 })
    .lean();

  const totalFeedbacks = feedbacks.length;
  const avgHostRating = totalFeedbacks > 0 
    ? feedbacks.reduce((sum, f) => sum + f.hostRating, 0) / totalFeedbacks 
    : 0;
  const avgEventRating = totalFeedbacks > 0 
    ? feedbacks.reduce((sum, f) => sum + f.eventRating, 0) / totalFeedbacks 
    : 0;

  const result = { 
    event: { 
      ...event, 
      joined,
      ratings: {
        totalFeedbacks,
        averageHostRating: Math.round(avgHostRating * 10) / 10,
        averageEventRating: Math.round(avgEventRating * 10) / 10,
        experiences: feedbacks.map(f => ({
          attendeeName: f.attendeeName,
          eventExperience: f.eventExperience,
          submittedAt: f.submittedAt
        }))
      }
    } 
  };

  await cacheSet(cacheKey, result, 600);

  return ok(res, result);
});

export const createEvent = asyncHandler(async (req, res) => {
  const errors = validateCreateEvent(req.body);
  if (errors.length) throw createError(400, errors.join(", "));

  const tags = normalizeTags(req.body.tags);
  const doc = {
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    date: new Date(req.body.date),
    organizerId: req.user.id,
    location: {
      formattedAddress: req.body.location.formattedAddress.trim(),
      lat: typeof req.body.location.lat === "number" ? req.body.location.lat : undefined,
      lng: typeof req.body.location.lng === "number" ? req.body.location.lng : undefined,
    },
    tags,
    attendees: [],
    attendeeCount: 0,
    
    category: req.body.category,
    duration: req.body.duration,
    capacity: req.body.capacity,
    entryFee: {
      isFree: req.body.entryFee?.isFree ?? true,
      amount: req.body.entryFee?.amount ?? 0
    },
    ageRestriction: req.body.ageRestriction || "All Ages",
    contactPerson: {
      name: req.body.contactPerson?.name?.trim(),
      email: req.body.contactPerson?.email?.trim(),
      phone: req.body.contactPerson?.phone?.trim()
    }
  };

  const event = await Event.create(doc);
  const eventId = event._id.toString();

  await User.updateOne(
    { _id: req.user.id },
    { $addToSet: { createdEvents: event._id } }
  );

  await cacheInvalidatePattern('events:list:*');
  await cacheInvalidatePattern('user:dashboard:*');

  const shareLink = `${process.env.APP_BASE_URL?.replace(/\/$/, "") || "http://localhost:5173"}/events/${eventId}`;
  return ok(res, { message: "Event created", eventId, shareLink }, 201);
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const err = validateObjectId(req.params.id, "eventId");
  if (err) throw createError(400, err);

  const event = await Event.findById(req.params.id).lean();
  if (!event) throw createError(404, "Event not found");
  if (event.organizerId.toString() !== req.user.id) {
    throw createError(403, "Only organizer can delete this event");
  }

  await Event.deleteOne({ _id: event._id });

  await User.updateOne(
    { _id: req.user.id },
    { $pull: { createdEvents: event._id } }
  );

  await User.updateMany(
    { joinedEvents: event._id },
    { $pull: { joinedEvents: event._id } }
  );

  return ok(res, { message: "Event deleted" });
});

export const joinEvent = asyncHandler(async (req, res) => {
  const err = validateObjectId(req.params.id, "eventId");
  if (err) throw createError(400, err);

  const event = await Event.findById(req.params.id).select("date organizerId attendees attendeeCount").lean();
  if (!event) throw createError(404, "Event not found");

  const now = Date.now();
  if (new Date(event.date).getTime() < now) {
    throw createError(400, "Cannot join a past event");
  }

  const uid = req.user.id;
  if (event.organizerId.toString() === uid) {
    throw createError(400, "Organizer does not need to join their own event");
  }

  const alreadyJoined = event.attendees.some(a => a.toString() === uid);
  if (alreadyJoined) {
    return ok(res, { message: "Already joined", joined: false, attendeeCount: event.attendeeCount });
  }

  await Promise.all([
    Event.updateOne(
      { _id: event._id },
      { $addToSet: { attendees: uid }, $inc: { attendeeCount: 1 } }
    ),
    User.updateOne(
      { _id: uid },
      { $addToSet: { joinedEvents: event._id } }
    )
  ]);

  await cacheInvalidatePattern(`event:details:${req.params.id}:*`);
  await cacheInvalidatePattern('user:dashboard:*');

  const updated = await Event.findById(event._id).select("attendeeCount").lean();
  return ok(res, { message: "Joined event", joined: true, attendeeCount: updated.attendeeCount });
});

export const leaveEvent = asyncHandler(async (req, res) => {
  const err = validateObjectId(req.params.id, "eventId");
  if (err) throw createError(400, err);

  const uid = req.user.id;

  const result = await Event.updateOne(
    { _id: req.params.id },
    { $pull: { attendees: uid }, $inc: { attendeeCount: -1 } }
  );

  let leftNow = result.modifiedCount > 0;

  if (leftNow) {
    await User.updateOne(
      { _id: uid },
      { $pull: { joinedEvents: req.params.id } }
    );
  }

  await cacheInvalidatePattern(`event:details:${req.params.id}:*`);
  await cacheInvalidatePattern('user:dashboard:*');

  const updated = await Event.findById(req.params.id).select("attendeeCount").lean();

  return ok(res, {
    message: leftNow ? "Left event" : "You were not an attendee",
    left: leftNow,
    attendeeCount: updated?.attendeeCount ?? 0,
  });
});

export const listAttendees = asyncHandler(async (req, res) => {
  const err = validateObjectId(req.params.id, "eventId");
  if (err) throw createError(400, err);

  const event = await Event.findById(req.params.id).select("organizerId attendees").lean();
  if (!event) throw createError(404, "Event not found");
  if (event.organizerId.toString() !== req.user.id) {
    throw createError(403, "Only organizer can view attendees");
  }

  const users = await User.find({ _id: { $in: event.attendees || [] } })
    .select("_id name email")
    .lean();

  return ok(res, { attendees: users });
});

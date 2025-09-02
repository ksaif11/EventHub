import createError from "http-errors";
import crypto from "crypto";
import Feedback from "../models/Feedback.js";
import FeedbackToken from "../models/FeedbackToken.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateObjectId } from "../utils/validators.js";
import { ok } from "../utils/apiResponse.js";
import { sendHtmlEmail } from "../utils/sendEmail.js";
import { getEmailTemplate } from "../utils/emailTemplates.js";
import { cacheInvalidatePattern } from '../services/cacheService.js';

const generateFeedbackToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const validateAttendance = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;

  const err = validateObjectId(eventId, "eventId");
  if (err) throw createError(400, err);

  const event = await Event.findById(eventId).lean();
  if (!event) throw createError(404, "Event not found");

  const attended = event.attendees.some(attendee => attendee.toString() === userId);
  if (!attended) {
    throw createError(403, "You must have attended this event to provide feedback");
  }

  const existingFeedback = await Feedback.findOne({ eventId, attendeeId: userId }).lean();
  if (existingFeedback) {
    throw createError(400, "You have already submitted feedback for this event");
  }

  return ok(res, { 
    canProvideFeedback: true, 
    eventTitle: event.title,
    organizerName: event.organizerId ? "Host" : "Unknown"
  });
});

export const validateToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const userId = req.user.id;

  if (!token) throw createError(400, "Token is required");

  const tokenDoc = await FeedbackToken.findOne({ token }).lean();
  if (!tokenDoc) throw createError(400, "Invalid feedback token");

  if (tokenDoc.attendeeId.toString() !== userId) {
    throw createError(403, "This token is not valid for your account");
  }

  if (tokenDoc.expiresAt < new Date()) {
    throw createError(400, "Feedback token has expired");
  }

  if (tokenDoc.used) {
    throw createError(400, "This feedback token has already been used");
  }

  const event = await Event.findById(tokenDoc.eventId).lean();
  if (!event) throw createError(404, "Event not found");

  const attended = event.attendees.some(attendee => attendee.toString() === userId);
  if (!attended) {
    throw createError(403, "You must have attended this event to provide feedback");
  }

  const existingFeedback = await Feedback.findOne({ 
    eventId: tokenDoc.eventId, 
    attendeeId: userId 
  }).lean();
  
  if (existingFeedback) {
    throw createError(400, "You have already submitted feedback for this event");
  }

  return ok(res, { 
    event: {
      _id: event._id,
      title: event.title,
      date: event.date,
      location: event.location
    },
    tokenValid: true
  });
});

export const submitFeedback = asyncHandler(async (req, res) => {
  const { eventId, hostRating, eventRating, eventExperience, hostFeedback, attendeeName } = req.body;
  const userId = req.user.id;

  if (!eventId || !hostRating || !eventRating || !attendeeName) {
    throw createError(400, "Event ID, host rating, event rating, and attendee name are required");
  }

  if (hostRating < 1 || hostRating > 5 || eventRating < 1 || eventRating > 5) {
    throw createError(400, "Ratings must be between 1 and 5");
  }

  const err = validateObjectId(eventId, "eventId");
  if (err) throw createError(400, err);

  const event = await Event.findById(eventId).lean();
  if (!event) throw createError(404, "Event not found");

  const attended = event.attendees.some(attendee => attendee.toString() === userId);
  if (!attended) {
    throw createError(403, "You must have attended this event to provide feedback");
  }

  const existingFeedback = await Feedback.findOne({ eventId, attendeeId: userId }).lean();
  if (existingFeedback) {
    throw createError(400, "You have already submitted feedback for this event");
  }

  const userName = await User.findById(userId).select('name').lean();

  const feedback = await Feedback.create({
    eventId,
    attendeeId: userId,
    attendeeName: attendeeName.trim(),
    hostRating,
    eventRating,
    eventExperience: eventExperience?.trim() || "",
    hostFeedback: hostFeedback?.trim() || ""
  });

  await cacheInvalidatePattern(`event:details:${eventId}:*`);

  return ok(res, { 
    message: "Feedback submitted successfully",
    feedback: {
      _id: feedback._id,
      attendeeName: feedback.attendeeName,
      hostRating: feedback.hostRating,
      eventRating: feedback.eventRating,
      submittedAt: feedback.createdAt
    }
  });
});

export const submitFeedbackWithToken = asyncHandler(async (req, res) => {
  const { token, hostRating, eventRating, eventExperience, hostFeedback, attendeeName } = req.body;
  const userId = req.user.id;

  if (!token || !hostRating || !eventRating || !attendeeName) {
    throw createError(400, "Token, host rating, event rating, and attendee name are required");
  }

  if (hostRating < 1 || hostRating > 5 || eventRating < 1 || eventRating > 5) {
    throw createError(400, "Ratings must be between 1 and 5");
  }

  const tokenDoc = await FeedbackToken.findOne({ token }).lean();
  if (!tokenDoc) throw createError(400, "Invalid feedback token");

  if (tokenDoc.attendeeId.toString() !== userId) {
    throw createError(403, "This token is not valid for your account");
  }

  if (tokenDoc.expiresAt < new Date()) {
    throw createError(400, "Feedback token has expired");
  }

  if (tokenDoc.used) {
    throw createError(400, "This feedback token has already been used");
  }

  const event = await Event.findById(tokenDoc.eventId).lean();
  if (!event) throw createError(404, "Event not found");

  const attended = event.attendees.some(attendee => attendee.toString() === userId);
  if (!attended) {
    throw createError(403, "You must have attended this event to provide feedback");
  }

  const existingFeedback = await Feedback.findOne({ 
    eventId: tokenDoc.eventId, 
    attendeeId: userId 
  }).lean();
  
  if (existingFeedback) {
    throw createError(400, "This feedback token has already been used");
  }

  const userName = await User.findById(userId).select('name').lean();

  const feedback = await Feedback.create({
    eventId: tokenDoc.eventId,
    attendeeId: userId,
    attendeeName: attendeeName.trim(),
    hostRating,
    eventRating,
    eventExperience: eventExperience?.trim() || "",
    hostFeedback: hostFeedback?.trim() || ""
  });

  await FeedbackToken.updateOne({ token }, { used: true });
  await cacheInvalidatePattern(`event:details:${tokenDoc.eventId}:*`);

  return ok(res, { 
    message: "Feedback submitted successfully",
    feedback: {
      _id: feedback._id,
      attendeeName: feedback.attendeeName,
      hostRating: feedback.hostRating,
      eventRating: feedback.eventRating,
      submittedAt: feedback.createdAt
    }
  });
});

export const generateFeedbackTokens = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;

  const err = validateObjectId(eventId, "eventId");
  if (err) throw createError(400, err);

  const event = await Event.findById(eventId).lean();
  if (!event) throw createError(404, "Event not found");

  if (event.organizerId.toString() !== userId) {
    throw createError(403, "Only the event organizer can generate feedback tokens");
  }

  const attendees = await User.find({ 
    _id: { $in: event.attendees || [] } 
  }).select('_id name email').lean();

  const tokens = [];
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  for (const attendee of attendees) {
    const existingFeedback = await Feedback.findOne({ 
      eventId, 
      attendeeId: attendee._id 
    }).lean();

    if (!existingFeedback) {
      const token = generateFeedbackToken();
      await FeedbackToken.create({
        eventId,
        attendeeId: attendee._id,
        token,
        expiresAt
      });

      const feedbackLink = `${process.env.APP_BASE_URL?.replace(/\/$/, "") || "http://localhost:5173"}/feedback?token=${token}`;
      
      // Use the new HTML email template
      const emailTemplate = getEmailTemplate('feedbackRequest', [event.title, attendee.name, feedbackLink]);
      await sendHtmlEmail(attendee.email, emailTemplate.subject, emailTemplate.html);

      tokens.push({
        attendeeName: attendee.name,
        attendeeEmail: attendee.email,
        token,
        feedbackLink
      });
    }
  }

  return ok(res, { 
    message: `Feedback tokens generated for ${tokens.length} attendees`,
    tokens
  });
});

export const sendFeedbackEmails = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;

  const err = validateObjectId(eventId, "eventId");
  if (err) throw createError(400, err);

  const event = await Event.findById(eventId).lean();
  if (!event) throw createError(404, "Event not found");

  if (event.organizerId.toString() !== userId) {
    throw createError(403, "Only the event organizer can send feedback emails");
  }

  const attendees = await User.find({ 
    _id: { $in: event.attendees || [] } 
  }).select('_id name email').lean();

  let sentCount = 0;
  for (const attendee of attendees) {
    const existingFeedback = await Feedback.findOne({ 
      eventId, 
      attendeeId: attendee._id 
    }).lean();

    if (!existingFeedback) {
      const token = generateFeedbackToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      await FeedbackToken.create({
        eventId,
        attendeeId: attendee._id,
        token,
        expiresAt
      });

      const feedbackLink = `${process.env.APP_BASE_URL?.replace(/\/$/, "") || "http://localhost:5173"}/feedback?token=${token}`;
      
      // Use the new HTML email template
      const emailTemplate = getEmailTemplate('feedbackRequest', [event.title, attendee.name, feedbackLink]);
      await sendHtmlEmail(attendee.email, emailTemplate.subject, emailTemplate.html);

      sentCount++;
    }
  }

  return ok(res, { 
    message: `Feedback emails sent to ${sentCount} attendees`,
    sentCount
  });
});

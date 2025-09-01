import mongoose from "mongoose";

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

export const validateFutureDate = (date, bufferMinutes = 1) => {
  const d = new Date(date);
  
  if (Number.isNaN(d.getTime())) {
    return { isValid: false, error: "Invalid date format" };
  }
  
  if (d.getTime() < Date.now()) {
    return { isValid: false, error: "Date must be in the future" };
  }
  
  if (d.getTime() < Date.now() + bufferMinutes * 60 * 1000) {
    return { isValid: false, error: `Event must be scheduled at least ${bufferMinutes} minute${bufferMinutes > 1 ? 's' : ''} in the future` };
  }
  
  return { isValid: true, error: null };
};

export const validateObjectId = (id, fieldName = "id") => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return `${fieldName} is invalid`;
  }
  return null;
};

export const validateCreateEvent = (body) => {
  const errors = [];

  if (!isNonEmptyString(body.title)) errors.push("title is required");
  if (!isNonEmptyString(body.description)) errors.push("description is required");

  const dateValidation = validateFutureDate(body.date, 1);
  if (!dateValidation.isValid) {
    errors.push(dateValidation.error);
  }

  const loc = body.location || {};
  if (!isNonEmptyString(loc.formattedAddress))
    errors.push("location.formattedAddress is required");

  if (loc.lat !== undefined && typeof loc.lat !== "number")
    errors.push("location.lat must be a number");
  if (loc.lng !== undefined && typeof loc.lng !== "number")
    errors.push("location.lng must be a number");

  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) errors.push("tags must be an array of strings");
    else if (!body.tags.every((t) => isNonEmptyString(t)))
      errors.push("every tag must be a non-empty string");
  }

  const validCategories = ["Meetup", "Workshop", "Conference", "Social", "Other"];
  if (!body.category || !validCategories.includes(body.category)) {
    errors.push("category must be one of: " + validCategories.join(", "));
  }

  if (!body.duration || typeof body.duration !== "number" || body.duration < 15) {
    errors.push("duration must be at least 15 minutes");
  }

  if (!body.capacity || typeof body.capacity !== "number" || body.capacity < 1) {
    errors.push("capacity must be at least 1");
  }

  if (body.entryFee !== undefined) {
    if (typeof body.entryFee.isFree !== "boolean") {
      errors.push("entryFee.isFree must be true or false");
    }
    if (!body.entryFee.isFree && (!body.entryFee.amount || body.entryFee.amount < 0)) {
      errors.push("entry fee amount must be 0 or greater for paid events");
    }
  }

  const validAgeRestrictions = ["All Ages", "18+", "21+", "Other"];
  if (body.ageRestriction && !validAgeRestrictions.includes(body.ageRestriction)) {
    errors.push("ageRestriction must be one of: " + validAgeRestrictions.join(", "));
  }

  if (body.contactPerson) {
    if (!isNonEmptyString(body.contactPerson.name)) {
      errors.push("contactPerson.name is required");
    }
    if (!isNonEmptyString(body.contactPerson.email)) {
      errors.push("contactPerson.email is required");
    } else if (!/^\S+@\S+\.\S+$/.test(body.contactPerson.email)) {
      errors.push("contactPerson.email must be a valid email");
    }
  }

  return errors;
};

export const normalizeTags = (tags) => {
  if (!tags || !Array.isArray(tags)) return [];
  return tags
    .map((t) => String(t).trim().toLowerCase())
    .filter((t) => t.length > 0);
};

export const parseTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim().toLowerCase()).filter((t) => t.length > 0);
  return String(tags)
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);
};

export const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const parseSort = (sort) => {
  const validSorts = {
    date: { date: 1 },
    date_desc: { date: -1 },
    popularity: { attendeeCount: -1, date: 1 },
  };

  return validSorts[sort] || validSorts.date;
};

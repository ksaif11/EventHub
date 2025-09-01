export const validateCreateEventForm = (values) => {
  const errors = {};

  if (!values.title?.trim()) errors.title = "Title is required";
  if (!values.description?.trim()) errors.description = "Description is required";

  if (!values.date) {
    errors.date = "Date & time is required";
  } else {
    const dateValidation = validateFutureDate(values.date, 1);
    if (!dateValidation.isValid) {
      errors.date = dateValidation.error;
    }
  }

  if (!values.location?.formattedAddress?.trim())
    errors.location = "Location is required";

  if (values.tags?.length) {
    const bad = values.tags.some((t) => !String(t).trim());
    if (bad) errors.tags = "Tags must be non-empty";
  }

  if (!values.category) errors.category = "Event category is required";

  if (!values.duration || values.duration < 15) {
    errors.duration = "Duration must be at least 15 minutes";
  }

  if (!values.capacity || values.capacity < 1) {
    errors.capacity = "Capacity must be at least 1";
  }

  if (values.entryFee) {
    if (typeof values.entryFee.isFree !== "boolean") {
      errors.entryFee = "Please specify if the event is free or paid";
    }
    if (!values.entryFee.isFree && (!values.entryFee.amount || values.entryFee.amount < 0)) {
      errors.entryFee = "Entry fee amount must be 0 or greater for paid events";
    }
  }

  if (values.contactPerson) {
    if (!values.contactPerson.name?.trim()) {
      errors.contactPerson = "Contact person name is required";
    }
    if (!values.contactPerson.email?.trim()) {
      errors.contactPerson = "Contact person email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(values.contactPerson.email)) {
      errors.contactPerson = "Contact person email must be valid";
    }
  }

  return errors;
};

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

export const getMinDateTime = (bufferMinutes = 1) => {
  const minDate = new Date(Date.now() + bufferMinutes * 60 * 1000);
  return minDate.toISOString().slice(0, 16);
};

export const normalizeTagsInput = (raw) => {
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter((t, i, arr) => t && arr.indexOf(t) === i);
};

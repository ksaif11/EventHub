import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    date: { type: Date },
    location: {
      formattedAddress: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },
    tags: [{ type: String }],
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    attendeeCount: { type: Number, default: 0 },
    feedbackSent: { type: Boolean, default: false },
    
    category: { type: String, enum: ["Meetup", "Workshop", "Conference", "Social", "Other"] },
    duration: { type: Number },
    capacity: { type: Number, min: 1 },
    entryFee: {
      isFree: { type: Boolean, default: true },
      amount: { type: Number, min: 0, default: 0 }
    },
    ageRestriction: { 
      type: String, 
      enum: ["All Ages", "18+", "21+", "Other"],
      default: "All Ages"
    },
    contactPerson: {
      name: { type: String },
      email: { type: String },
      phone: { type: String }
    }
  },
  { timestamps: true }
);

eventSchema.index({ date: 1 });
eventSchema.index({ organizerId: 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ title: "text", description: "text" });

export default mongoose.model("Event", eventSchema);

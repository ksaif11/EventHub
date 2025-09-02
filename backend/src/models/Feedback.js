import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    eventId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Event", 
      required: true 
    },
    attendeeId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    attendeeName: { 
      type: String, 
      required: true 
    },
    hostRating: { 
      type: Number, 
      required: true, 
      min: 1, 
      max: 5 
    },
    eventRating: { 
      type: Number, 
      required: true, 
      min: 1, 
      max: 5 
    },
    hostFeedback: { 
      type: String, 
      trim: true 
    },
    eventExperience: { 
      type: String, 
      trim: true 
    },
    submittedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { timestamps: true }
);

feedbackSchema.index({ eventId: 1, attendeeId: 1 }, { unique: true });
feedbackSchema.index({ eventId: 1 });
feedbackSchema.index({ attendeeId: 1 });

export default mongoose.model("Feedback", feedbackSchema);

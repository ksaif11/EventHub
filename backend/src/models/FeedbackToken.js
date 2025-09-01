import mongoose from "mongoose";

const feedbackTokenSchema = new mongoose.Schema(
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
    token: { 
      type: String, 
      required: true
    },
    expiresAt: { 
      type: Date, 
      required: true 
    },
    used: { 
      type: Boolean, 
      default: false 
    }
  },
  { timestamps: true }
);

feedbackTokenSchema.index({ token: 1 });
feedbackTokenSchema.index({ eventId: 1, attendeeId: 1 });
feedbackTokenSchema.index({ expiresAt: 1 });

export default mongoose.model("FeedbackToken", feedbackTokenSchema);

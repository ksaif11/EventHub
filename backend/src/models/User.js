import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, index: true },
    passwordHash: { type: String },
    isVerified: { type: Boolean, default: false },
    joinedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    createdEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

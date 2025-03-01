import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    wakeUpTime: { type: String, required: true },
    sleepTime: { type: String, required: true },
    habits: { type: [String], default: [] },
    priorities: { type: [String], default: [] },
    freeTime: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
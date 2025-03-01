import mongoose from 'mongoose';

const SetupResponseSchema = new mongoose.Schema({
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      unique: true // Make userId unique to ensure one setup per user
    },
    wakeTime: String,
    bedTime: String,
    habits: String,
    priorities: String,
    freeTime: String,
  }, { timestamps: true });

export default mongoose.models.SetupResponse || mongoose.model('SetupResponse', SetupResponseSchema);
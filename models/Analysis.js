import mongoose from "mongoose";

const AnalysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    efficiencyScore: { type: String, required: true, default: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0" },
    tasksCompleted: { type: String, required: true, default: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0" },
  },
  { timestamps: true }
);

export default mongoose.models.Analysis || mongoose.model("Analysis", AnalysisSchema);

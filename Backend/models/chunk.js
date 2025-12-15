import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema({
  text: String,
  embedding: [Number],
  summary: String,
  keywords: [String],
  timestamps: [String],
  created_at: { type: Date, default: Date.now }
});

chunkSchema.index({ embedding: "vector" });

export default mongoose.model("Chunk", chunkSchema);

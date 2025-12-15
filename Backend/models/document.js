import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  filename: String,
  modality: String,   // "audio" or "pdf"
  summary: String,
  keywords: [String],
  totalChunks: Number,
  uploaded_at: { type: Date, default: Date.now }
});

export default mongoose.model("Document", documentSchema);

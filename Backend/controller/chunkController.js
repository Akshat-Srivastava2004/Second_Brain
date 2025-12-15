import { chunkText } from "../services/chunker.js";

export const chunkController = (req, res) => {
  try {
    const { text } = req.body;

    if (!text) return res.status(400).json({ error: "Text is required" });

    const chunks = chunkText(text);

    res.json({
      message: "Chunking successful",
      chunks
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

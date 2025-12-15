import { generateEmbeddings } from "../services/embedder.js";

export const embedController = async (req, res) => {
  try {
    const { chunks } = req.body;

    if (!chunks || !Array.isArray(chunks))
      return res.status(400).json({ error: "Chunks array required" });

    const embeddings = await generateEmbeddings(chunks);

    res.json({
      message: "Embeddings generated successfully",
      embeddings
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

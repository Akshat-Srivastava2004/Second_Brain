import { chunkText } from "../services/chunker.js";
import { generateEmbeddings } from "../services/embedder.js";
import Chunk from "../models/chunk.js";
import Document from "../models/document.js";
import { transcribeAudio } from "../services/audioTranscribe.js";

export const uploadAudio = async (req, res) => {
  try {
    const audioPath = req.file.path;
    console.log("the audio path is ", audioPath);

    // 1️⃣ Audio → English text
    const text = await transcribeAudio(audioPath);
    console.log("the text is from the audio is ", text);

    // 2️⃣ Chunking
    const chunks = chunkText(text);
    console.log("the chunks are ", chunks);

    // 3️⃣ Embeddings
    const embeddings = await generateEmbeddings(chunks);
    console.log("the embedding is ", embeddings);

    // 4️⃣ Store chunks
    const docsToInsert = chunks.map((chunk, idx) => ({
      text: chunk,
      embedding: embeddings[idx],
      summary: "",        // optional
      keywords: [],       // optional
      timestamps: []      // optional
    }));

    await Chunk.insertMany(docsToInsert);

    // 5️⃣ Store document metadata
    await Document.create({
      filename: req.file.originalname,
      modality: "audio",
      summary: "",
      keywords: [],
      totalChunks: chunks.length
    });

    // ✅ SUCCESS RESPONSE
    res.json({
      message: "Audio processed successfully",
      totalChunks: chunks.length
    });

  } catch (err) {
    console.error("UPLOAD AUDIO ERROR 👉", err);
    res.status(500).json({ error: err.message });
  }
};

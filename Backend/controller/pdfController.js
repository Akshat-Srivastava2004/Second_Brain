import { extractPDF } from "../services/pdfExtract.js";
import { processText } from "../services/llm.js";
import { chunkText } from "../services/chunker.js";
import { generateEmbeddings } from "../services/embedder.js";
import Chunk from "../models/chunk.js";
import Document from "../models/document.js";
export const uploadPDF = async (req, res) => {
  try {
    const pdfPath = req.file.path;
   console.log("the pdf paath is ",pdfPath)
    // 1. PDF → text
    const text = await extractPDF(pdfPath);
    console.log("the text is ",text)
    // 2. LLM clean + metadata
    const formatted = await processText(text);
      console.log("the formatted text is ",text);
    // 3. Chunk
    const chunks = chunkText(formatted.clean_text);
     console.log("the chunks data is ",chunks)
    // 4. Embedding
    const embeddings = await generateEmbeddings(chunks);
    console.log("the embeddins are",embeddings)

    const docsToInsert = chunks.map((chunk, idx) => ({
      text: chunk,
      embedding: embeddings[idx],
      summary: formatted.summary,
      keywords: formatted.keywords,
      timestamps: formatted.timestamps
    }));

    await Chunk.insertMany(docsToInsert);

    await Document.create({
      filename: req.file.originalname,
      modality: "pdf",
      summary: formatted.summary,
      keywords: formatted.keywords,
      totalChunks: chunks.length
    });

    res.json({ message: "PDF processed successfully", formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

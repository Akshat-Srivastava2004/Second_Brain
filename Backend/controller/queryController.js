import axios from "axios";
import Chunk from "../models/chunk.js";

export const queryAI = async (req, res) => {
  try {
    const { question } = req.body;
    console.log("Receiving user text:", question);

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    /* 1️⃣ Embed user query (Gemini – OK to keep) */
    const embedRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
      {
        content: {
          parts: [{ text: question }]
        }
      }
    );

    const queryEmbedding = embedRes.data.embedding.values;
    console.log("the query emdbeedung",queryEmbedding.length)
    const count = await Chunk.countDocuments();
    console.log("Total chunks 👉", count);
    /* 2️⃣ Vector search (MongoDB Atlas) */
    const results = await Chunk.aggregate([
      {
        $vectorSearch: {
          index: "chunk_vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 1
        }
      }
    ]);
    console.log("the result is ",results);
    if (!results.length) {
      return res.json({
        answer: "Not found in document.",
        sources: []
      });
    }

    const context = results.map(r => r.text).join("\n\n");

    /* 3️⃣ Generate answer using GROQ (Llama 3.3 70B) */
    const prompt = `
You are a strict assistant.
Answer ONLY from the context below.
If the answer is not present, reply exactly:
"Not found in document."

Context:
${context}

Question:
${question}
`;

    const groqRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You answer strictly from provided context." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const answer =
      groqRes.data.choices?.[0]?.message?.content || "No answer generated";

    res.json({
      answer,
      sources: results
    });

  } catch (err) {
    console.error("QUERY ERROR 👉", err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
};

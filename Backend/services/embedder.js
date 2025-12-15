import axios from "axios";
export const generateEmbeddings = async (chunks) => {
  try {
    const embeddings = [];

    for (let chunk of chunks) {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
        {
          content: {
            parts: [{ text: chunk }]
          }
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      embeddings.push(res.data.embedding.values);
    }

    return embeddings;
  } catch (err) {
    console.error("❌ Error generating embeddings:", err.response?.data || err.message);
    throw new Error("Embedding generation failed");
  }
};

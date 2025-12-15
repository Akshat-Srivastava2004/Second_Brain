import fs from "fs";
import axios from "axios";
import FormData from "form-data";

export const transcribeAudio = async (filePath) => {
  try {
    /* 1️⃣ Speech → Text (Groq Whisper) */
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    formData.append("model", "whisper-large-v3");

    const transcribeRes = await axios.post(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          ...formData.getHeaders()
        }
      }
    );

    const detectedText = transcribeRes.data.text;
    console.log("📝 Detected text:", detectedText);

    /* 2️⃣ Translate to NORMAL English */
    const translatePrompt = `
Translate the following text into clear, simple, natural English.
Do not explain.
Return only the translated English text.

Text:
${detectedText}
`;

    const translateRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a professional translator." },
          { role: "user", content: translatePrompt }
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

    const englishText =
      translateRes.data.choices[0].message.content.trim();

    // ✅ IMPORTANT FIX: RETURN STRING ONLY
    return englishText;

  } catch (err) {
    console.error(
      "❌ Audio Transcription Error:",
      err.response?.data || err.message
    );
    throw new Error("Audio transcription + translation failed");
  }
};

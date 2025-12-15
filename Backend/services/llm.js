import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log("the geni ai is ",genAI)

export const processText = async (text) => {
  try {
    const model = genAI.getGenerativeModel({
      model:  "gemini-2.5-flash", // ✅ STABLE MODEL
    });

    const prompt = `
Clean and structure the following text.

Return:
1. Clean text
2. Short summary (5-6 lines)
3. Keywords

TEXT:
${text}
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return {
      clean_text: response,
      summary: response.slice(0, 400),
      keywords: [],
    };
  } catch (err) {
    console.error("❌ LLM Formatting Error:", err);
    throw err;
  }
};

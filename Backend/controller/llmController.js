import { processText } from "../services/llm.js";

export const llmFormatController = async (req, res) => {
  try {
    const { rawText } = req.body;

    if (!rawText)
      return res.status(400).json({ error: "rawText is required" });

    const formatted = await processText(rawText);

    res.json({
      message: "LLM formatting successful",
      formatted
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

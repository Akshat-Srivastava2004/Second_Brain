export const chunkText = (text, maxLength = 600) => {
  if (!text) return [];

  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let currentChunk = "";

  for (let sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += sentence + " ";
    } else {
      chunks.push(currentChunk.trim());
      currentChunk = sentence + " ";
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

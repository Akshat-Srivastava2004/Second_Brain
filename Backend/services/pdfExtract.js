import fs from "fs";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

export const extractPDF = async (filePath) => {
  console.log("📄 extractPDF called with path:", filePath);

  try {
    if (!fs.existsSync(filePath)) {
      throw new Error("PDF file not found");
    }

    const data = new Uint8Array(fs.readFileSync(filePath));

    const loadingTask = pdfjs.getDocument({ data });
    const pdf = await loadingTask.promise;

    console.log("📘 Total pages:", pdf.numPages);

    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      const pageText = content.items.map(item => item.str).join(" ");
      fullText += pageText + "\n";
    }

    console.log("📃 Extracted text length:", fullText.length);
    return fullText;

  } catch (err) {
    console.error("❌ PDF Extraction Error:", err);
    throw err;
  }
};

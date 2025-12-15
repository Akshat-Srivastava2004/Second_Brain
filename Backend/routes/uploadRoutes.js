import express from "express";
import multer from "multer";
import path from "path";

import { uploadAudio } from "../controller/audioController.js";
import { uploadPDF } from "../controller/pdfController.js";
import { queryAI } from "../controller/queryController.js";
const router = express.Router();

/* ---------- MULTER STORAGE ---------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // .pdf, .mp3
    const name = path.basename(file.originalname, ext);

    cb(null, `${Date.now()}-${name}${ext}`); // ✅ extension preserved
  }
});

const upload = multer({ storage });

/* ---------- ROUTE ---------- */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const mime = req.file.mimetype;

    // AUDIO FILE
    if (mime.startsWith("audio/")) {
      return uploadAudio(req, res);
    }

    // PDF FILE
    if (mime === "application/pdf") {
      return uploadPDF(req, res);
    }

    // UNSUPPORTED FILE
    return res.status(400).json({
      message: "Unsupported file type. Only audio and PDF allowed."
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/query", queryAI);

export default router;

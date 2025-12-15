import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./database/connect.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import cors from "cors";
dotenv.config({
    path: './public/.env'
});


const app = express();
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://second-brain-backend-1bb9.onrender.com"
  ],
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static("public/uploads"));

connectDB();

app.use("/api/chat", uploadRoutes);
app.listen(5000, () => console.log("Server running on port 5000 ✔"));

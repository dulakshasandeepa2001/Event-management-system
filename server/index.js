import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

dotenv.config()

import { seedUsers } from "./userSeed.js";
import authRoutes from './routes/authRoutes.js'
import studentRoutes from './routes/studentRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import eventRoutes from "./routes/eventRoutes.js";
import marksRoutes from "./routes/marksRoutes.js";
import deadlineRoutes from './routes/deadlineRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import aiAgentRoutes from './routes/aiAgentRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
// Base route
app.get("/", (req, res) => {
    res.send("Student Resource Management System API");
});

// Import routes (we’ll add them later)

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/batch", batchRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/marks", marksRoutes);
app.use("/api/deadlines", deadlineRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/agent", aiAgentRoutes);

const PORT = process.env.PORT || 5001;

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
        await seedUsers({ ensureConnection: false });
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.log("Server bootstrap error:", err);
        process.exit(1);
    }
};

startServer();
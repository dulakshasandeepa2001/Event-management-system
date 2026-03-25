import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

import authRoutes from './routes/authRoutes.js'
import studentRoutes from './routes/studentRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import eventRoutes from "./routes/eventRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("MongoDB connection error:", err));

// Base route
app.get("/", (req, res) => {
    res.send("Student Resource Management System API");
});

// Import routes (we’ll add them later)

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/batch", batchRoutes);
app.use("/api/event", eventRoutes);

const PORT = process.env.PORT || 5001;
app.listen(
    PORT, () => console.log(`Server running on port ${PORT}`)
);
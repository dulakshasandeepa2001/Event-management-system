import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
<<<<<<< HEAD
=======
import path from "path"
import { fileURLToPath } from "url"
>>>>>>> ra_new_part

dotenv.config()

import authRoutes from './routes/authRoutes.js'
import studentRoutes from './routes/studentRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
<<<<<<< HEAD
=======
import eventRoutes from "./routes/eventRoutes.js";
import marksRoutes from "./routes/marksRoutes.js";
import deadlineRoutes from './routes/deadlineRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
>>>>>>> ra_new_part

const app = express();
app.use(cors());
app.use(express.json());

<<<<<<< HEAD
=======
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

>>>>>>> ra_new_part
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
<<<<<<< HEAD
app.use("/api/student", studentRoutes);
app.use("/api/batch", batchRoutes);
=======
app.use("/api/students", studentRoutes);
app.use("/api/batch", batchRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/marks", marksRoutes);
app.use("/api/deadlines", deadlineRoutes);
app.use("/api/submissions", submissionRoutes);
>>>>>>> ra_new_part

const PORT = process.env.PORT || 5001;
app.listen(
    PORT, () => console.log(`Server running on port ${PORT}`)
);
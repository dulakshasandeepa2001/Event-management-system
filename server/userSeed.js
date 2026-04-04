import dotenv from "dotenv";
import { pathToFileURL } from "url";

dotenv.config();

import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Rep from "./models/Rep.js";
import { connectDB } from "./db/db.js";

export const seedUsers = async ({ ensureConnection = true } = {}) => {
    if (ensureConnection) {
        await connectDB();
    }

    const adminUser = {
        u_name: "Admin User",
        u_email: "admin@example.com",
        u_password: await bcrypt.hash("admin123", 10),
        u_role: "admin"
    };

    const lecturerUser = {
        u_name: "Lecture User",
        u_email: "lecture@example.com",
        u_password: await bcrypt.hash("lecture123", 10),
        u_role: "lecturer",
        u_faculty: "Computing",
        u_course: "Academic Affairs",
        u_year: 1,
        u_semester: 1,
    };

    const batchRep = {
        r_name: "Batch rep",
        r_email: "brep1@example.com",
        r_password: await bcrypt.hash("brep1", 10),
        r_role: "batchrep",
        isBatchRep: true
    };

    try {
        await User.updateOne(
            { u_email: adminUser.u_email },
            { $set: adminUser },
            { upsert: true }
        );

        await User.updateOne(
            { u_email: lecturerUser.u_email },
            { $set: lecturerUser },
            { upsert: true }
        );

        await Rep.updateOne(
            { r_email: batchRep.r_email },
            { $set: batchRep },
            { upsert: true }
        );

        console.log("Users and reps seeded successfully");
    } catch (err) {
        console.error("Seeding error:", err);
        throw err;
    }
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    seedUsers()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
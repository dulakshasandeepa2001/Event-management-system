import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import User from './models/User.js'
import Rep from './models/Rep.js'
import { connectDB } from "./db/db.js";

const seedUsers = async () => {
    await connectDB();

    const users = [
        {
            u_name: "Admin User",
            u_email: "admin@example.com",
            u_password: await bcrypt.hash("admin123", 10),
            u_role: "admin",
        }
    ];

    const reps = [
        {
            r_name: "Batch rep",
            r_email: "brep1@example.com",
            r_password: await bcrypt.hash("brep1", 10),
            r_role: "batchrep",
            isBatchRep: true,
        }
    ];
    
    try {
        for (const user of users) {
            await User.updateOne(
                { u_email: user.u_email },
                { $set: user },
                { upsert: true }
            );
        }

        for (const rep of reps) {
            await Rep.updateOne(
                { r_email: rep.r_email },
                { $set: rep },
                { upsert: true }
            );
        }

        console.log("Users and reps seeded successfully");
        process.exit();
    }
    catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
};

seedUsers(); 
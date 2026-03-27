import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import User from './models/User.js'
import { connectDB } from "./db/db.js";

const seedUsers = async () => {
    await connectDB();
    const users = [
        {
            u_name: "Admin User",
            u_email: "admin@example.com",
            u_password: await bcrypt.hash("admin123", 10),
            u_role: "admin",
        },
        {
            u_name: "Batch rep",
            u_email: "brep1@example.com",
            u_password: await bcrypt.hash("brep1", 10),
            u_role: "batchrep",
            isBatchRep: true,
            u_batchId: "69c42b2978b1a37cbbd3392e"
        },        
        

    ];
    
    try {
        await User.deleteMany({});
        await User.insertMany(users);
        console.log("Users seeded successfully");
        process.exit();
    }
    catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
};

seedUsers(); 
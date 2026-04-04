import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import User from './models/User.js'
<<<<<<< HEAD
=======
import Rep from './models/Rep.js'
>>>>>>> ra_new_part
import { connectDB } from "./db/db.js";

const seedUsers = async () => {
    await connectDB();
<<<<<<< HEAD
=======

>>>>>>> ra_new_part
    const users = [
        {
            u_name: "Admin User",
            u_email: "admin@example.com",
            u_password: await bcrypt.hash("admin123", 10),
            u_role: "admin",
<<<<<<< HEAD
        },
        {
            u_name: "Batch rep",
            u_email: "brep1@example.com",
            u_password: await bcrypt.hash("brep1", 10),
            u_role: "batchrep",
            isBatchRep: true,
=======
        }
    ];

    const reps = [
        {
            r_name: "Batch rep",
            r_email: "brep1@example.com",
            r_password: await bcrypt.hash("brep1", 10),
            r_role: "batchrep",
            isBatchRep: true,
            u_batchId: "69c42b2978b1a37cbbd3392e"
>>>>>>> ra_new_part
        },        
        

    ];
    
    try {
<<<<<<< HEAD
        await User.deleteMany({});
        await User.insertMany(users);
        console.log("Users seeded successfully");
=======
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
>>>>>>> ra_new_part
        process.exit();
    }
    catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
};

seedUsers(); 
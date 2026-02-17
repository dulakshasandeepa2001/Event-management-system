import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Register new user
export const register = async (req, res) => {
    try {
        const { u_name, u_email, u_password, u_role, u_faculty, u_course, u_year, u_semester } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ u_email });
        if (existingUser) return res.status(400).json({ message: "Email already registered" });

        // Hash password
        const hashedPassword = await bcrypt.hash(u_password, 10);

        const newUser = new User({
            u_name, 
            u_email,
            u_password: hashedPassword,
            u_role,
            u_faculty,
            u_course,
            u_year,
            u_semester
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Login user
export const login = async (req, res) => {
    try {
        const { u_email, u_password } = req.body;

        const user = await User.findOne({ u_email }).populate("u_faculty u_course");
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(u_password, user.u_password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, u_role: user.u_role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            token,
            user: {
                id: user._id,
                u_name: user.u_name,
                u_email: user.u_email,
                u_role: user.u_role,
                isBatchRep: user.isBatchRep || false,
                u_faculty: user.u_faculty,
                u_course: user.u_course,
                u_year: user.u_year,
                u_semester: user.u_semester
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Get user profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("u_faculty u_course");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
};

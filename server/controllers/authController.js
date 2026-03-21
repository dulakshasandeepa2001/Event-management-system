import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// utility to return a safe serialized user object
const sanitizeUser = (user) => ({
    id: user._id,
    u_name: user.u_name,
    u_email: user.u_email,
    u_role: user.u_role || "student",
    isBatchRep: !!user.isBatchRep,
    u_faculty: user.u_faculty,
    u_course: user.u_course,
    u_year: user.u_year,
    u_semester: user.u_semester
});


// Register new user
export const signin = async (req, res) => {
    try {
        const { u_name, u_email, u_password, u_role, u_faculty, u_course, u_year, u_semester } = req.body;
        
        // Validate required fields
        if (!u_name || !u_email || !u_password) {
            return res.status(400).json({ 
                message: "Please provide all required fields: u_name, u_email, u_password" 
            });
        }
        
        let user = await User.findOne({ u_email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(u_password, salt);

        const newUser = new User({
            u_name,
            u_email,
            u_password: hashedPassword,
            u_role: u_role || "student",
            u_faculty: u_faculty || null,
            u_course: u_course || null,
            u_year: u_year || 1,
            u_semester: u_semester || 1
        });

        await newUser.save();

        const token = jwt.sign(
            { id: newUser._id, u_role: newUser.u_role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "User registered successfully",
            token,
            user: sanitizeUser(newUser)
        });
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
        if (!isMatch) {
            console.log("❌ Backend: Invalid password for user:", u_email);
            return res.status(400).json({ message: "Invalid credentials" });
        }
        
        console.log("✅ Backend: Password match successful");

        const token = jwt.sign(
            { id: user._id, u_role: user.u_role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        
        console.log("🔑 Backend: Token generated for user:", user.u_name);
        console.log("👤 Backend: User role:", user.u_role);

        const loginResponse = {
            token,
            user: {
                id: user._id,
                u_name: user.u_name,
                u_email: user.u_email,
                u_role: user.u_role || "student",
                isBatchRep: user.isBatchRep || false,
                u_faculty: user.u_faculty,
                u_course: user.u_course,
                u_year: user.u_year,
                u_semester: user.u_semester
            }
        };

        res.status(200).json(loginResponse);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Get user profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
};

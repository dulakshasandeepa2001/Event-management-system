import User from '../models/User.js'
import PendingStudent from '../models/PendingStudent.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// utility to return a safe serialized user object
const sanitizeUser = (user) => ({
    id: user._id,
    u_name: user.u_name,
    u_email: user.u_email,
    u_role: user.u_role || "student",
    isBatchRep: !!user.isBatchRep,
    u_regno: user.u_regno,  // ✅ Include Student ID
    u_faculty: user.u_faculty,
    u_course: user.u_course,
    u_year: user.u_year,
    u_semester: user.u_semester
});


// Register new user with validation
export const signin = async (req, res) => {
    try {
        const { u_name, u_email, u_password, u_role, u_regno, u_faculty, u_course, u_year, u_semester } = req.body;
        
        // Validate required fields
        if (!u_name || !u_email || !u_password || !u_regno) {
            return res.status(400).json({ 
                message: "All fields are required: Full Name, Student ID, Email, Password",
                code: "MISSING_FIELDS",
                accountExists: false
            });
        }
        
        // ✅ CHECK 1: Must be in PendingStudent (approved list from Excel upload)
        const pendingStudent = await PendingStudent.findOne({ 
            u_regno: u_regno 
        });

        if (!pendingStudent) {
            return res.status(403).json({ 
                message: "❌ Student ID not found in system. Admin hasn't added you yet. Please contact admin.", 
                code: "STUDENT_NOT_FOUND",
                accountExists: false  // ✅ Not in approved list
            });
        }

        // ✅ CHECK 2: Verify email matches the uploaded data from Excel
        if (pendingStudent.u_email && pendingStudent.u_email !== u_email) {
            return res.status(403).json({ 
                message: `❌ Email mismatch. Your registered email in system: ${pendingStudent.u_email}`,
                code: "EMAIL_MISMATCH",
                accountExists: false,
                correctEmail: pendingStudent.u_email
            });
        }

        // ✅ CHECK 3: Verify course matches (if provided in Excel)
        if (pendingStudent.u_course && u_course && pendingStudent.u_course !== u_course) {
            return res.status(403).json({ 
                message: `❌ Course mismatch. Your enrolled course is: ${pendingStudent.u_course}`,
                code: "COURSE_MISMATCH",
                accountExists: false,
                correctCourse: pendingStudent.u_course
            });
        }

        // ✅ CHECK 4: Prevent duplicate Student ID in User table (already created account before)
        const existingByRegno = await User.findOne({ u_regno: u_regno });
        if (existingByRegno) {
            return res.status(400).json({ 
                message: `❌ Account already created for Student ID "${u_regno}". You can only create ONE account. Please LOG IN.`,
                code: "STUDENT_ID_EXISTS",
                accountExists: true,  // ✅ Flag indicating account exists
                existingEmail: existingByRegno.u_email
            });
        }

        // ✅ CHECK 5: Prevent duplicate email in User table
        const existingByEmail = await User.findOne({ u_email: u_email });
        if (existingByEmail) {
            return res.status(400).json({ 
                message: "❌ This email is already registered. Please LOGIN or use different email.",
                code: "EMAIL_EXISTS",
                accountExists: true,  // ✅ Flag indicating account exists
                existingRegno: existingByEmail.u_regno
            });
        }

        // ✅ ALL VALIDATIONS PASSED - Create the account
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(u_password, salt);

        const newUser = new User({
            u_name,
            u_email,
            u_password: hashedPassword,
            u_role: u_role || "student",
            u_regno: u_regno,
            u_faculty: u_faculty || null,
            u_course: u_course || pendingStudent.u_course || null,
            u_year: u_year || pendingStudent.u_year || 1,
            u_semester: u_semester || pendingStudent.u_semester || 1,
            u_batchId: pendingStudent.batchId,
            u_isActive: true
        });

        await newUser.save();
        console.log('✅ Student registered:', u_name, 'RegNo:', u_regno);

        // ✅ AUTO-SAVE: Also update PendingStudent with complete signup data
        await PendingStudent.findByIdAndUpdate(pendingStudent._id, { 
            u_isApproved: true,
            u_name: u_name,  // Save the name they entered
            u_email: u_email,  // Confirm email
            u_course: u_course || pendingStudent.u_course,  // Save their course
            u_year: u_year || pendingStudent.u_year,  // Save their year
            u_semester: u_semester || pendingStudent.u_semester,  // Save their semester
            u_faculty: u_faculty,  // Save faculty
            signedUpAt: new Date(),  // Track when they signed up
            userId: newUser._id  // Link to User account
        });
        console.log('✅ PendingStudent updated with signup data');

        const token = jwt.sign(
            { id: newUser._id, u_role: newUser.u_role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "✅ Account created successfully!",
            code: "REGISTRATION_SUCCESS",
            accountExists: false,  // ✅ Account just created successfully
            token,
            user: sanitizeUser(newUser)
        });
    } catch (err) {
        console.error('❌ Registration error:', err.message);
        res.status(500).json({ 
            message: "Server error. Please try again.",
            code: "SERVER_ERROR",
            accountExists: false
        });
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

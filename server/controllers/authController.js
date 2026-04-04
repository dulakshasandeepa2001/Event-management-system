import User from '../models/User.js'
<<<<<<< HEAD
=======
import PendingStudent from '../models/PendingStudent.js'
import Rep from '../models/Rep.js'
>>>>>>> ra_new_part
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// utility to return a safe serialized user object
const sanitizeUser = (user) => ({
    id: user._id,
    u_name: user.u_name,
    u_email: user.u_email,
    u_role: user.u_role || "student",
    isBatchRep: !!user.isBatchRep,
<<<<<<< HEAD
=======
    u_regno: user.u_regno,  // ✅ Include Student ID
>>>>>>> ra_new_part
    u_faculty: user.u_faculty,
    u_course: user.u_course,
    u_year: user.u_year,
    u_semester: user.u_semester
});

<<<<<<< HEAD

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

=======
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidRegNo = (regNo) => /^[A-Za-z0-9\-_/]{3,20}$/.test(regNo);
const isStrongPassword = (password) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);


// Register new user with validation
export const signin = async (req, res) => {
    try {
        const { u_name, u_email, u_password, u_role, u_regno, u_faculty, u_course, u_year, u_semester } = req.body;

        const normalizedName = (u_name || '').trim();
        const normalizedEmail = (u_email || '').trim().toLowerCase();
        const normalizedRegNo = (u_regno || '').trim().toUpperCase();
        const normalizedFaculty = (u_faculty || '').trim();
        const normalizedCourse = (u_course || '').trim();
        const normalizedYear = u_year !== undefined && u_year !== null && String(u_year).trim() !== '' ? Number(u_year) : null;
        const normalizedSemester = u_semester !== undefined && u_semester !== null && String(u_semester).trim() !== '' ? Number(u_semester) : null;
        
        // Validate required fields
        if (!normalizedName || !normalizedEmail || !u_password || !normalizedRegNo) {
            return res.status(400).json({ 
                message: "All fields are required: Full Name, Student ID, Email, Password",
                code: "MISSING_FIELDS",
                accountExists: false
            });
        }

        if (normalizedName.length < 3 || normalizedName.length > 80) {
            return res.status(400).json({
                message: "Full name must be between 3 and 80 characters",
                code: "INVALID_NAME",
                accountExists: false,
            });
        }

        if (!isValidEmail(normalizedEmail)) {
            return res.status(400).json({
                message: "Please enter a valid email address",
                code: "INVALID_EMAIL",
                accountExists: false,
            });
        }

        if (!isValidRegNo(normalizedRegNo)) {
            return res.status(400).json({
                message: "Student ID can only contain letters, numbers, -, _, / and must be 3-20 chars",
                code: "INVALID_STUDENT_ID",
                accountExists: false,
            });
        }

        if (!isStrongPassword(u_password || '')) {
            return res.status(400).json({
                message: "Password must be at least 8 characters and include both letters and numbers",
                code: "WEAK_PASSWORD",
                accountExists: false,
            });
        }

        if (normalizedYear !== null && (!Number.isInteger(normalizedYear) || normalizedYear < 1 || normalizedYear > 4)) {
            return res.status(400).json({
                message: "Year must be between 1 and 4",
                code: "INVALID_YEAR",
                accountExists: false,
            });
        }

        if (normalizedSemester !== null && (!Number.isInteger(normalizedSemester) || normalizedSemester < 1 || normalizedSemester > 8)) {
            return res.status(400).json({
                message: "Semester must be between 1 and 8",
                code: "INVALID_SEMESTER",
                accountExists: false,
            });
        }

        if (normalizedCourse.length > 80 || normalizedFaculty.length > 80) {
            return res.status(400).json({
                message: "Faculty and course must be 80 characters or fewer",
                code: "FIELD_TOO_LONG",
                accountExists: false,
            });
        }
        
        // ✅ CHECK 1: Must be in PendingStudent (approved list from Excel upload)
        const pendingStudent = await PendingStudent.findOne({ 
            u_regno: normalizedRegNo 
        });

        if (!pendingStudent) {
            return res.status(403).json({ 
                message: "❌ Student ID not found in system. Admin hasn't added you yet. Please contact admin.", 
                code: "STUDENT_NOT_FOUND",
                accountExists: false  // ✅ Not in approved list
            });
        }

        // ✅ CHECK 2: Verify email matches the uploaded data from Excel
        if (pendingStudent.u_email && pendingStudent.u_email.trim().toLowerCase() !== normalizedEmail) {
            return res.status(403).json({ 
                message: `❌ Email mismatch. Your registered email in system: ${pendingStudent.u_email}`,
                code: "EMAIL_MISMATCH",
                accountExists: false,
                correctEmail: pendingStudent.u_email
            });
        }

        // ✅ CHECK 3: Verify course matches (if provided in Excel)
        if (pendingStudent.u_course && normalizedCourse && pendingStudent.u_course !== normalizedCourse) {
            return res.status(403).json({ 
                message: `❌ Course mismatch. Your enrolled course is: ${pendingStudent.u_course}`,
                code: "COURSE_MISMATCH",
                accountExists: false,
                correctCourse: pendingStudent.u_course
            });
        }

        // ✅ CHECK 4: Prevent duplicate Student ID in User table (already created account before)
        const existingByRegno = await User.findOne({ u_regno: normalizedRegNo });
        if (existingByRegno) {
            return res.status(400).json({ 
                message: `❌ Account already created for Student ID "${normalizedRegNo}". You can only create ONE account. Please LOG IN.`,
                code: "STUDENT_ID_EXISTS",
                accountExists: true,  // ✅ Flag indicating account exists
                existingEmail: existingByRegno.u_email
            });
        }

        // ✅ CHECK 5: Prevent duplicate email in User table
        const existingByEmail = await User.findOne({ u_email: normalizedEmail });
        if (existingByEmail) {
            return res.status(400).json({ 
                message: "❌ This email is already registered. Please LOGIN or use different email.",
                code: "EMAIL_EXISTS",
                accountExists: true,  // ✅ Flag indicating account exists
                existingRegno: existingByEmail.u_regno
            });
        }

        // ✅ ALL VALIDATIONS PASSED - Create the account
>>>>>>> ra_new_part
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(u_password, salt);

        const newUser = new User({
<<<<<<< HEAD
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
=======
            u_name: normalizedName,
            u_email: normalizedEmail,
            u_password: hashedPassword,
            u_role: u_role || "student",
            u_regno: normalizedRegNo,
            u_faculty: normalizedFaculty || null,
            u_course: normalizedCourse || pendingStudent.u_course || null,
            u_year: normalizedYear || pendingStudent.u_year || 1,
            u_semester: normalizedSemester || pendingStudent.u_semester || 1,
            u_batchId: pendingStudent.batchId,
            u_isActive: true
        });

        await newUser.save();
        console.log('✅ Student registered:', normalizedName, 'RegNo:', normalizedRegNo);

        // ✅ AUTO-SAVE: Also update PendingStudent with complete signup data
        await PendingStudent.findByIdAndUpdate(pendingStudent._id, { 
            u_isApproved: true,
            u_name: normalizedName,  // Save the name they entered
            u_email: normalizedEmail,  // Confirm email
            u_course: normalizedCourse || pendingStudent.u_course,  // Save their course
            u_year: normalizedYear || pendingStudent.u_year,  // Save their year
            u_semester: normalizedSemester || pendingStudent.u_semester,  // Save their semester
            u_faculty: normalizedFaculty,  // Save faculty
            signedUpAt: new Date(),  // Track when they signed up
            userId: newUser._id  // Link to User account
        });
        console.log('✅ PendingStudent updated with signup data');
>>>>>>> ra_new_part

        const token = jwt.sign(
            { id: newUser._id, u_role: newUser.u_role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

<<<<<<< HEAD
        res.status(200).json({
            message: "User registered successfully",
=======
        res.status(201).json({
            message: "✅ Account created successfully!",
            code: "REGISTRATION_SUCCESS",
            accountExists: false,  // ✅ Account just created successfully
>>>>>>> ra_new_part
            token,
            user: sanitizeUser(newUser)
        });
    } catch (err) {
<<<<<<< HEAD
        console.log(err);
        res.status(500).json({ message: "Server error" });
=======
        console.error('❌ Registration error:', err.message);
        res.status(500).json({ 
            message: "Server error. Please try again.",
            code: "SERVER_ERROR",
            accountExists: false
        });
>>>>>>> ra_new_part
    }
};

// Login user
export const login = async (req, res) => {
    try {
        const { u_email, u_password } = req.body;
<<<<<<< HEAD

        const user = await User.findOne({ u_email }).populate("u_faculty u_course");
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(u_password, user.u_password);
        if (!isMatch) {
            console.log("❌ Backend: Invalid password for user:", u_email);
=======
        const normalizedEmail = (u_email || "").trim().toLowerCase();

        if (!normalizedEmail || !u_password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        let user = await User.findOne({ u_email: normalizedEmail }).populate("u_faculty u_course");
        let isRep = false;

        if (!user) {
            user = await Rep.findOne({ r_email: normalizedEmail });
            isRep = !!user;
        }

        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const hashedPassword = isRep ? user.r_password : user.u_password;
        const isMatch = await bcrypt.compare(u_password, hashedPassword);
        if (!isMatch) {
            console.log("❌ Backend: Invalid password for user:", normalizedEmail);
>>>>>>> ra_new_part
            return res.status(400).json({ message: "Invalid credentials" });
        }
        
        console.log("✅ Backend: Password match successful");

<<<<<<< HEAD
        const token = jwt.sign(
            { id: user._id, u_role: user.u_role },
=======
        const userRole = isRep ? (user.r_role || "batchrep") : (user.u_role || "student");
        const userName = isRep ? user.r_name : user.u_name;
        const userEmail = isRep ? user.r_email : user.u_email;
        const userIsBatchRep = isRep ? true : (user.isBatchRep || false);

        const token = jwt.sign(
            { id: user._id, u_role: userRole },
>>>>>>> ra_new_part
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        
<<<<<<< HEAD
        console.log("🔑 Backend: Token generated for user:", user.u_name);
        console.log("👤 Backend: User role:", user.u_role);
=======
        console.log("🔑 Backend: Token generated for user:", userName);
        console.log("👤 Backend: User role:", userRole);
>>>>>>> ra_new_part

        const loginResponse = {
            token,
            user: {
                id: user._id,
<<<<<<< HEAD
                u_name: user.u_name,
                u_email: user.u_email,
                u_role: user.u_role || "student",
                isBatchRep: user.isBatchRep || false,
                u_faculty: user.u_faculty,
                u_course: user.u_course,
                u_year: user.u_year,
                u_semester: user.u_semester
=======
                u_name: userName,
                u_email: userEmail,
                u_role: userRole,
                isBatchRep: userIsBatchRep,
                u_faculty: isRep ? null : user.u_faculty,
                u_course: isRep ? null : user.u_course,
                u_year: isRep ? null : user.u_year,
                u_semester: isRep ? null : user.u_semester
>>>>>>> ra_new_part
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
<<<<<<< HEAD
        const user = await User.findById(req.user.id);
=======
        if (!req.user) return res.status(404).json({ message: "User not found" });

        if (req.user.sourceModel === 'Rep') {
            return res.status(200).json({
                id: req.user._id,
                u_name: req.user.u_name,
                u_email: req.user.u_email,
                u_role: req.user.u_role,
                isBatchRep: true,
            });
        }

        const user = await User.findById(req.user._id).select('-u_password');
>>>>>>> ra_new_part
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
};

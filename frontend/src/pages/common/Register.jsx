import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import welcomeIllustration from "../../assets/qwe1234.jpg";

const Register = () => {
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [faculty, setFaculty] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const regNoRegex = /^[A-Za-z0-9\-_/]{3,20}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const normalizedName = name.trim();
    const normalizedStudentId = studentId.trim().toUpperCase();
    const normalizedEmail = studentEmail.trim().toLowerCase();
    const normalizedFaculty = faculty.trim();
    const normalizedCourse = course.trim();
    const normalizedYear = year ? Number(year) : null;
    const normalizedSemester = semester ? Number(semester) : null;

    // Validation
    if (!normalizedName || normalizedName.length < 3) {
      setError("Full Name must be at least 3 characters");
      return;
    }

    if (!normalizedStudentId) {
      setError("Student ID is required");
      return;
    }

    if (!regNoRegex.test(normalizedStudentId)) {
      setError("Student ID must be 3-20 chars and contain only letters, numbers, -, _, /");
      return;
    }
    
    if (!normalizedEmail) {
      setError("Student Email is required");
      return;
    }

    if (!emailRegex.test(normalizedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!normalizedFaculty) {
      setError("Faculty is required");
      return;
    }

    if (!normalizedCourse || normalizedCourse.length < 2) {
      setError("Course is required");
      return;
    }

    if (!normalizedYear || normalizedYear < 1 || normalizedYear > 4) {
      setError("Please select a valid year (1-4)");
      return;
    }

    if (!normalizedSemester || normalizedSemester < 1 || normalizedSemester > 8) {
      setError("Please select a valid semester (1-8)");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters with letters and numbers");
      return;
    }

    try {
      const response = await API.post("/auth/register", {
        u_name: normalizedName,
        u_email: normalizedEmail,
        u_password: password,
        u_role: "student",
        u_regno: normalizedStudentId,
        u_faculty: normalizedFaculty,
        u_course: normalizedCourse,
        u_year: normalizedYear,
        u_semester: normalizedSemester
      });

      setSuccess("✅ Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      
      // ✅ Get structured error response from backend
      const errorResponse = err.response?.data;
      const accountExists = errorResponse?.accountExists || false;
      const code = errorResponse?.code || "UNKNOWN";
      const message = errorResponse?.message || "Registration failed";

      // ✅ Handle based on accountExists flag
      if (accountExists === true) {
        // Account already created - suggest user login
        setError(`${message}\n\nUse the Login button to access your existing account.`);
        console.log('⚠️ Account already exists:', { code, accountExists });
      } else if (accountExists === false) {
        // Account doesn't exist but validation failed - show why
        setError(message);
        console.log('❌ Validation failed:', { code, accountExists, message });
      }
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side - Register Form */}
      <div className="bg-[#1a1a1a] flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">Register</h1>
            <p className="text-gray-400 text-sm">Create your student account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm whitespace-pre-wrap">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-2 rounded-lg text-sm">
                {success}
              </div>
            )}

            {/* Name Input */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-gray-400 text-sm">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none transition"
                placeholder="Enter your full name"
                minLength={3}
                maxLength={80}
                required
              />
            </div>

            {/* Student ID & Email Inputs - Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student ID Input */}
              <div className="space-y-2">
                <label htmlFor="studentId" className="text-gray-400 text-sm">
                  Student ID *
                </label>
                <input
                  type="text"
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none transition"
                  placeholder="e.g., CS001"
                  pattern="[A-Za-z0-9\-_/]{3,20}"
                  minLength={3}
                  maxLength={20}
                  required
                />
              </div>

              {/* Student Email Input */}
              <div className="space-y-2">
                <label htmlFor="studentEmail" className="text-gray-400 text-sm">
                  Student Email *
                </label>
                <input
                  type="email"
                  id="studentEmail"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none transition"
                  placeholder="e.g., student@example.com"
                  required
                />
              </div>
            </div>

            {/* Faculty & Course Inputs - Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Faculty Input */}
              <div className="space-y-2">
                <label htmlFor="faculty" className="text-gray-400 text-sm">
                  Faculty
                </label>
                <select
                  id="faculty"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none transition"
                  required
                >
                  <option value="">Select Faculty</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business">Business</option>
                  <option value="Science">Science</option>
                  <option value="Arts">Arts</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Computing">Computing</option>
                </select>
              </div>

              {/* Course Input */}
              <div className="space-y-2">
                <label htmlFor="course" className="text-gray-400 text-sm">
                  Course
                </label>
                <input
                  type="text"
                  id="course"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none transition"
                  placeholder="e.g., Software Engineering"
                  minLength={2}
                  maxLength={80}
                  required
                />
              </div>
            </div>

            {/* Year & Semester Inputs - Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Year Input */}
              <div className="space-y-2">
                <label htmlFor="year" className="text-gray-400 text-sm">
                  Year
                </label>
                <select
                  id="year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none transition"
                  required
                >
                  <option value="">Select Year</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </div>

              {/* Semester Input */}
              <div className="space-y-2">
                <label htmlFor="semester" className="text-gray-400 text-sm">
                  Semester
                </label>
                <select
                  id="semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none transition"
                  required
                >
                  <option value="">Select Semester</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                </select>
              </div>
            </div>

            {/* Password & Confirm Password Inputs - Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-gray-400 text-sm">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none transition pr-12"
                    placeholder="Create a password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-gray-400 text-sm">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none transition pr-12"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg transition duration-200 mt-6"
            >
              Create Account
            </button>

            {/* Login Link */}
            <div className="text-center text-sm">
              <span className="text-gray-400">Already have an account? </span>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-white hover:text-cyan-500 transition font-medium"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Welcome Section */}
      <div className="bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/30 backdrop-blur-3xl"></div>
        
        <div className="relative z-10 text-center text-white space-y-6 max-w-lg">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              Join our<br />student portal
            </h2>
            <p className="text-cyan-100 text-lg">
              Create an account to get started
            </p>
          </div>

          <div className="mt-12 flex justify-center">
            <img
              src={welcomeIllustration}
              alt="Student portal illustration"
              className="w-full max-w-md rounded-2xl object-cover shadow-2xl shadow-blue-900/30"
            />
          </div>
        </div>

        {/* Search Icon in bottom right */}
        <div className="absolute bottom-8 right-8">
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full cursor-pointer hover:bg-white/30 transition">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

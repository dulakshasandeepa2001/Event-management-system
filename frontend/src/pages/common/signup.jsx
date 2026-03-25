import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../../api";

const Signup = () => {
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const response = await API.post("/auth/signin", {
        u_name: name,
        u_email: studentId,
        u_password: password,
        u_role: "student",
        u_faculty: null,
        u_course: null,
        u_year: null,
        u_semester: null
      });

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side - Signup Form */}
      <div className="bg-[#1a1a1a] flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">Sign Up</h1>
            <p className="text-gray-400 text-sm">Create your student account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm">
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
                className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none transition"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Student ID Input */}
            <div className="space-y-2">
              <label htmlFor="studentId" className="text-gray-400 text-sm">
                Student ID
              </label>
              <input
                type="text"
                id="studentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none transition"
                placeholder="Enter your student ID"
                required
              />
            </div>

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
                  className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none transition pr-12"
                  placeholder="Create a password"
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
                  className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none transition pr-12"
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

            {/* Sign Up Button */}
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition duration-200 mt-6"
            >
              Create Account
            </button>

            {/* Login Link */}
            <div className="text-center text-sm">
              <span className="text-gray-400">Already have an account? </span>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-white hover:text-purple-500 transition font-medium"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Welcome Section */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-purple-600/30 backdrop-blur-3xl"></div>
        
        <div className="relative z-10 text-center text-white space-y-6 max-w-lg">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              Join our<br />student portal
            </h2>
            <p className="text-purple-100 text-lg">
              Create an account to get started
            </p>
          </div>

          {/* Illustration Placeholder */}
          <div className="mt-12 flex justify-center">
            <div className="w-full max-w-md">
              <svg viewBox="0 0 400 300" className="w-full h-auto">
                {/* Simple illustration of students working */}
                <g>
                  {/* Background elements */}
                  <circle cx="320" cy="80" r="60" fill="rgba(255,255,255,0.1)" />
                  <circle cx="80" cy="240" r="40" fill="rgba(255,255,255,0.1)" />
                  
                  {/* Students illustration */}
                  <g transform="translate(100, 120)">
                    {/* Person 1 */}
                    <ellipse cx="40" cy="100" rx="30" ry="8" fill="rgba(0,0,0,0.1)" />
                    <rect x="25" y="60" width="30" height="40" rx="15" fill="white" />
                    <circle cx="40" cy="40" r="18" fill="white" />
                    <path d="M 30 75 L 20 95" stroke="white" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 50 75 L 60 95" stroke="white" strokeWidth="4" strokeLinecap="round" />
                  </g>
                  
                  <g transform="translate(180, 80)">
                    {/* Person 2 with laptop */}
                    <ellipse cx="50" cy="120" rx="35" ry="8" fill="rgba(0,0,0,0.1)" />
                    <rect x="35" y="70" width="30" height="50" rx="15" fill="white" />
                    <circle cx="50" cy="50" r="20" fill="white" />
                    <path d="M 40 95 L 30 115" stroke="white" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 60 95 L 70 115" stroke="white" strokeWidth="4" strokeLinecap="round" />
                    <rect x="60" y="85" width="40" height="25" rx="2" fill="rgba(255,255,255,0.9)" />
                  </g>
                  
                  {/* Decorative leaves */}
                  <path d="M 350 260 Q 360 250 370 260 Q 360 270 350 260" fill="white" fillOpacity="0.7" />
                  <path d="M 340 270 Q 345 265 350 270 Q 345 275 340 270" fill="white" fillOpacity="0.7" />
                </g>
              </svg>
            </div>
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

export default Signup;
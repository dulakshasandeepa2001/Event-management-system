import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Log login attempt (don't log password in production)
    console.log("🔐 Login attempt with email:", email);

    try {
      const user = await login(email, password);
      console.log("✅ Login successful! User data:", user);
      console.log("👤 User role:", user.u_role);
      console.log("📧 User email:", user.u_email);
      console.log("🎯 User name:", user.u_name);
      
      // Redirect based on user role
      console.log("🚀 Redirecting based on role:", user.u_role);
      
      if (user.u_role === "admin") {
        setTimeout(() => {
          navigate("/admin-dashboard");
        }, 100);
      } else if (user.u_role === "batchrep") {
        setTimeout(() => {
          navigate("/batchrep-dashboard");
        }, 100);
      } else {
        // Default to student dashboard
        setTimeout(() => {
          navigate("/student-dashboard");
        }, 100);
      }
                  
    } catch (err) {
      console.error("❌ Login error:", err);
      console.error("📛 Error response:", err.response?.data);
      console.error("📛 Error message:", err.response?.data?.message);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side - Login Form */}
      <div className="bg-[#1a1a1a] flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">Login</h1>
            <p className="text-gray-400 text-sm">Enter your account details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-gray-400 text-sm">
                Username
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none transition"
                placeholder="Enter your email"
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
                  placeholder="Enter your password"
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

            {/* Forgot Password */}
            <div className="flex justify-start">
              <a href="#" className="text-gray-400 text-sm hover:text-purple-500 transition">
                Forgot Password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition duration-200"
            >
              Login
            </button>

            {/* Sign Up Link */}
            <div className="text-center text-sm">
              <span className="text-gray-400">Don't have an account? </span>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-white hover:text-purple-500 transition font-medium"
              >
                Sign up
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
              Welcome to<br />student portal
            </h2>
            <p className="text-purple-100 text-lg">
              Login to access your account
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

export default Login;

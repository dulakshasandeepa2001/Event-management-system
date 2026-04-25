import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import welcomeIllustration from "../../assets/qwe1234.jpg";

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

    console.log("🔐 Login attempt with email:", email);

    try {
      const user = await login(email, password);
      console.log("✅ Login successful! User data:", user);
      console.log("👤 User role:", user.u_role);
      console.log("📧 User email:", user.u_email);
      console.log("🎯 User name:", user.u_name);

      console.log("🚀 Redirecting based on role:", user.u_role);

      if (user.u_role === "admin") {
        setTimeout(() => {
          navigate("/admin-dashboard");
        }, 100);
      } else if (user.u_role === "lecturer") {
        setTimeout(() => {
          navigate("/lecture-dashboard");
        }, 100);
      } else if (user.u_role === "batchrep") {
        setTimeout(() => {
          navigate("/batchrep-dashboard");
        }, 100);
      } else {
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

            <div className="space-y-2">
              <label htmlFor="email" className="text-gray-400 text-sm">
                Username
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none transition"
                placeholder="Enter your email"
                required
              />
            </div>

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

            <div className="flex justify-start">
              <a href="#" className="text-gray-400 text-sm hover:text-cyan-500 transition">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg transition duration-200"
            >
              Login
            </button>

            <div className="text-center text-sm">
              <span className="text-gray-400">Don't have an account? </span>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-white hover:text-cyan-500 transition font-medium"
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/30 backdrop-blur-3xl"></div>

        <div className="relative z-10 text-center text-white space-y-6 max-w-lg">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              Welcome to<br />student portal
            </h2>
            <p className="text-cyan-100 text-lg">
              Login to access your account
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
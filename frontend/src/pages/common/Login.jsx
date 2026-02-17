// D:\Uni_Hub\frontend\src\pages\common\Login.jsx
import React, { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");        // email input
  const [password, setPassword] = useState("");  // password input
  const [error, setError] = useState("");        // error messages

  const { login } = useAuth();                   // context login function
  const navigate = useNavigate();                // for redirect after login

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await login(email, password); // call AuthContext login
      // redirect based on role
      if (user.u_role === "admin") navigate("/admin-dashboard");
      else navigate("/"); // can change later for student/lecturer routes
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div id="login_bg" className="flex flex-col items-center h-screen justify-center bg-gradient-to-b from-blue-200 to-gray-800 space-y-6">
      <h2 className="font-pacific text-3xl text-white my_font_family">Information Management System</h2>
      <div className="border shadow p-6 space-y-6 bg-white rounded-lg">
        <label className="font-semibold">Welcome</label>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-500 my_font_family">{error}</p>}

          <div className="flex items-center border border-gray-500 rounded p-1">
            <label htmlFor="email" className="bg-gray-900 text-white w-36 h-10 p-2 px-8 my_font_family">E-MAIL</label>
            <input 
              type="email" 
              className="h-10 p-4 w-80" 
              placeholder="Enter e-mail" 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <div className="h-10 w-10 bg-gray-900 text-white flex items-center justify-center">
              <FaUser />
            </div>
          </div>

          <div className="flex items-center border border-gray-500 rounded p-1">
            <label htmlFor="password" className="bg-gray-900 text-white w-36 h-10 p-2 px-8 my_font_family">PASSWORD</label>
            <input 
              type="password" 
              className="h-10 p-4 w-80" 
              placeholder="Enter password" 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <div className="h-10 w-10 bg-gray-900 text-white flex items-center justify-center">
              <FaLock />
            </div>
          </div>

          <div className="flex items-center justify-between my_font_family">
            <label className="inline-flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox" />
              <span className="text-gray-800 text-xs">Remember me</span>
            </label>
            <a href="#" className="text-gray-800 text-xs">Forgotten Password</a>
          </div>

          <div>
            <button 
              type="submit" 
              className="px-4 py-1 border border-blue-200 rounded text-white text-xs bg-blue-600 hover:border-blue-400"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

// that code base used for authentication context in React application. It provides a way to manage user authentication state across the app, including login, logout, and registration functionalities. The context also handles restoring the user's session on page refresh by checking for a stored token and validating it with the backend.
import React, {
  createContext,// for creating the context it is de
  useState,// for managing user and loading state
  useEffect,// for restoring user session on page refresh
  useContext,// for consuming the context in other components
} from "react";
import API from "../api.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore login on page refresh
  useEffect(() => {
    const restoreUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Validate token & get fresh user
        const res = await API.get("/auth/profile");

        // If backend returns user directly
        const restoredUser = res.data.user || res.data;

        setUser(restoredUser);
        localStorage.setItem("user", JSON.stringify(restoredUser));
      } catch (error) {
        // Token expired or invalid
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, []);

  // LOGIN
  const login = async (u_email, u_password) => {
    console.log("📡 AuthContext: Sending login request to API...");
    console.log("📧 Email:", u_email);
<<<<<<< HEAD
    
    // Only append @my.sliit.lk for emails without a domain (student emails like "johndoe@gmail.com")
    // Don't append if it already has @example.com or full email format
    let finalEmail = u_email;
    if (!u_email.includes("@")) {
      // No domain at all, append student domain
      finalEmail = u_email + "@my.sliit.lk";
    } else if (u_email.endsWith("@gmail.com") || u_email.endsWith("@yahoo.com") || u_email.endsWith("@outlook.com")) {
      // Common email providers - append student domain
      finalEmail = u_email + "@my.sliit.lk";
    }
    // Otherwise keep the email as-is (admin@example.com, brep1@example.com, etc.)
=======

    const finalEmail = u_email.trim().toLowerCase();
>>>>>>> ra_new_part
    
    const res = await API.post("/auth/login", {
      u_email: finalEmail,
      u_password,
    });

    console.log("📥 AuthContext: Received response from server");
    console.log("🔑 Token received:", res.data.token ? "Yes" : "No");
    console.log("👤 User data received:", res.data.user);

    const token = res.data.token;
    const loggedUser = res.data.user;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(loggedUser));
    console.log("💾 Saved token and user to localStorage");

    setUser(loggedUser);
    console.log("✅ AuthContext: Login complete, user state updated");

    return loggedUser;
  };

  // REGISTER (Signup)
  const register = async (data) => {
    const res = await API.post("/auth/signin", data);
    return res.data;
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  return useContext(AuthContext);
};

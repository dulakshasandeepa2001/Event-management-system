import React, {
  createContext,
  useState,
  useEffect,
  useContext,
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
    const res = await API.post("/auth/login", {
      u_email,
      u_password,
    });

    const token = res.data.token;
    const loggedUser = res.data.user;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(loggedUser));

    setUser(loggedUser);

    return loggedUser;
  };

  // REGISTER
  const register = async (data) => {
    const res = await API.post("/auth/register", data);
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

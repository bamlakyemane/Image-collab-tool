// frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";
import { initializeSocket, disconnectSocket } from "../services/socket";
import { isSocketConnected } from "../services/socket";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Set up axios interceptor
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Load user on mount and token change
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        setUser(null);
        return;
      }

      try {
        const response = await api.get("/auth/profile");
        // ✅ ADD THIS
        setUser(response.data.user);
        console.log(
          "AuthProvider - User role set to:",
          response.data.user.role,
        ); // ✅ ADD THIS
      } catch (error) {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  useEffect(() => {
    if (token) {
      const socketInstance = initializeSocket(token);
    } else {
      disconnectSocket();
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });

      if (response.data.success) {
        const { token, user } = response.data;

        localStorage.setItem("token", token);
        setToken(token);
        setUser(user);
        // ✅ Initialize socket after login with a small delay
        setTimeout(() => {
          const socketInstance = initializeSocket(token);
        }, 500);
        return { success: true, user };
      }
      // In AuthContext.jsx, add this to the login function after setting token:
      console.log(
        "AuthContext - Login success, token set in localStorage:",
        localStorage.getItem("token"),
      );

      return { success: false, message: "Login failed" };
    } catch (error) {
      console.error(
        "AuthContext - Login error:",
        error.response?.data || error.message,
      );
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await api.post("/auth/signup", {
        name,
        email,
        password,
      });

      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        setToken(token);
        setUser(user);
        return { success: true, user };
      }
      return { success: false, message: "Signup failed" };
    } catch (error) {
      console.error(
        "AuthContext - Signup error:",
        error.response?.data || error.message,
      );
      return {
        success: false,
        message: error.response?.data?.message || "Signup failed",
      };
    }
  };

  const logout = () => {
    // ✅ Clear localStorage
    localStorage.removeItem("token");

    // ✅ Clear state
    setToken(null);
    setUser(null);

    // ✅ Clear axios headers
    delete api.defaults.headers.common["Authorization"];

    // ✅ Disconnect socket if connected
    if (window.socket) {
      window.socket.disconnect();
      window.socket = null;
    }

    // ✅ Redirect to login page
    window.location.href = "/login";
  };

  const value = {
    user,
    loading,
    token,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

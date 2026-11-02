import React, { createContext, useContext, useState, useEffect } from "react";
import { userApi } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'signup'

  // Fetch logged in user profile on app start
  const fetchProfile = async () => {
    try {
      const data = await userApi.getProfile();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (credentials) => {
    const data = await userApi.login(credentials);
    setUser({
      name: data.name,
      email: data.email,
      age: data.age,
      usage: data.usage,
    });
    setAuthModalOpen(false);
    window.location.reload();
    return data;
  };

  const signup = async (userData) => {
    const data = await userApi.signup(userData);
    setUser({
      name: data.name,
      email: data.email,
      age: data.age,
      usage: data.usage || { tokenUsed: 0, tokenLimit: 1000000, totalTokenUsed: 0 },
    });
    setAuthModalOpen(false);
    window.location.reload();
    return data;
  };

  const logout = async () => {
    try {
      await userApi.logout();
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
      window.location.reload();
    }
  };

  const deleteAccount = async () => {
    await userApi.deleteAccount();
    setUser(null);
    window.location.reload();
  };

  const updateUserUsage = (newUsage) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        usage: {
          ...prev.usage,
          tokenUsed: (prev.usage?.tokenUsed || 0) + (newUsage?.totalTokens || 0),
          totalTokenUsed: (prev.usage?.totalTokenUsed || 0) + (newUsage?.totalTokens || 0),
        },
      };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authModalOpen,
        setAuthModalOpen,
        authMode,
        setAuthMode,
        login,
        signup,
        logout,
        deleteAccount,
        refreshProfile: fetchProfile,
        updateUserUsage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

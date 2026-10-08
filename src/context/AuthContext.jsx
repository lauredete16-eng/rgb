// src/context/AuthContext.jsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import UserService from "../services/UserServices.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─────────────────────────────────────────────
  // Restaurer la session
  // ─────────────────────────────────────────────
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("lcl_current_user");

      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Erreur restauration session :", error);
      localStorage.removeItem("lcl_current_user");
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────
  // CONNEXION
  // ─────────────────────────────────────────────
  const login = async (username, password) => {
    try {
      const user = await UserService.authenticate(username, password);

      setCurrentUser(user);

      localStorage.setItem(
        "lcl_current_user",
        JSON.stringify(user)
      );

      return user;
    } catch (error) {
      throw error;
    }
  };

  // ─────────────────────────────────────────────
  // DÉCONNEXION
  // ─────────────────────────────────────────────
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("lcl_current_user");
  };

  // ─────────────────────────────────────────────
  // CRÉER UN UTILISATEUR
  // ─────────────────────────────────────────────
  const register = async (userData) => {
    try {
      const user = await UserService.createUser(userData);

      setCurrentUser(user);

      localStorage.setItem(
        "lcl_current_user",
        JSON.stringify(user)
      );

      return user;
    } catch (error) {
      throw error;
    }
  };

  // ─────────────────────────────────────────────
  // METTRE À JOUR L'UTILISATEUR
  // ─────────────────────────────────────────────
  const updateUser = async (updates) => {
    if (!currentUser) {
      throw new Error("Aucun utilisateur connecté");
    }

    try {
      const updatedUser = await UserService.updateUser(
        currentUser.id,
        updates
      );

      setCurrentUser(updatedUser);

      localStorage.setItem(
        "lcl_current_user",
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  // ─────────────────────────────────────────────
  // RÉCUPÉRER L'UTILISATEUR
  // ─────────────────────────────────────────────
  const refreshUser = async () => {
    if (!currentUser) return null;

    try {
      const user = await UserService.getUserById(currentUser.id);

      setCurrentUser(user);

      localStorage.setItem(
        "lcl_current_user",
        JSON.stringify(user)
      );

      return user;
    } catch (error) {
      console.error(
        "Erreur actualisation utilisateur :",
        error
      );

      return null;
    }
  };

  // ─────────────────────────────────────────────
  // DÉBLOQUER LE COMPTE
  // ─────────────────────────────────────────────
  const unlockAccount = async () => {
    if (!currentUser) {
      throw new Error("Aucun utilisateur connecté");
    }

    try {
      const updatedUser = await UserService.unlockAccount(
        currentUser.id
      );

      setCurrentUser(updatedUser);

      localStorage.setItem(
        "lcl_current_user",
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  // ─────────────────────────────────────────────
  // CHANGER LE MOT DE PASSE
  // ─────────────────────────────────────────────
  const changePassword = async (
    oldPassword,
    newPassword
  ) => {
    if (!currentUser) {
      throw new Error("Aucun utilisateur connecté");
    }

    return await UserService.changePassword(
      currentUser.id,
      oldPassword,
      newPassword
    );
  };

  const value = {
    currentUser,
    setCurrentUser,

    login,
    logout,
    register,

    updateUser,
    refreshUser,
    unlockAccount,
    changePassword,

    loading,
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────
// HOOK useAuth
// ─────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur de AuthProvider"
    );
  }

  return context;
}

export default AuthContext;
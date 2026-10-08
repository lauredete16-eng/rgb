
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import UserService from '../services/UserServices.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateKey, setUpdateKey] = useState(0);

  // Restaurer la session
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('lcl_current_user');

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error(
        'Erreur restauration session :',
        error
      );

      localStorage.removeItem('lcl_current_user');
    } finally {
      setLoading(false);
    }
  }, []);

  // Connexion
  const login = async (username, password) => {
    try {
      const authenticatedUser =
        await UserService.authenticate(
          username,
          password
        );

      setUser(authenticatedUser);

      localStorage.setItem(
        'lcl_current_user',
        JSON.stringify(authenticatedUser)
      );

      setUpdateKey((prev) => prev + 1);

      return authenticatedUser;
    } catch (error) {
      throw error;
    }
  };

  // Déconnexion
  const logout = () => {
    setUser(null);

    localStorage.removeItem('lcl_current_user');

    setUpdateKey((prev) => prev + 1);
  };

  // Inscription
  const register = async (userData) => {
    try {
      const newUser =
        await UserService.createUser(userData);

      setUser(newUser);

      localStorage.setItem(
        'lcl_current_user',
        JSON.stringify(newUser)
      );

      setUpdateKey((prev) => prev + 1);

      return newUser;
    } catch (error) {
      throw error;
    }
  };

  // Modifier l'utilisateur
  const updateUser = async (updates) => {
    if (!user) {
      throw new Error('Aucun utilisateur connecté');
    }

    try {
      const updatedUser =
        await UserService.updateUser(
          user.id,
          updates
        );

      setUser(updatedUser);

      localStorage.setItem(
        'lcl_current_user',
        JSON.stringify(updatedUser)
      );

      setUpdateKey((prev) => prev + 1);

      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  // Actualiser les informations utilisateur
  const refreshUser = async () => {
    if (!user) {
      return null;
    }

    try {
      const updatedUser =
        await UserService.getUserById(user.id);

      setUser(updatedUser);

      localStorage.setItem(
        'lcl_current_user',
        JSON.stringify(updatedUser)
      );

      setUpdateKey((prev) => prev + 1);

      return updatedUser;
    } catch (error) {
      console.error(
        'Erreur actualisation utilisateur :',
        error
      );

      return null;
    }
  };

  // Débloquer le compte
  const unlockAccount = async () => {
    if (!user) {
      throw new Error('Aucun utilisateur connecté');
    }

    try {
      const updatedUser =
        await UserService.unlockAccount(user.id);

      setUser(updatedUser);

      localStorage.setItem(
        'lcl_current_user',
        JSON.stringify(updatedUser)
      );

      setUpdateKey((prev) => prev + 1);

      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  // Changer le mot de passe
  const changePassword = async (
    oldPassword,
    newPassword
  ) => {
    if (!user) {
      throw new Error('Aucun utilisateur connecté');
    }

    return await UserService.changePassword(
      user.id,
      oldPassword,
      newPassword
    );
  };

  const value = {
    // Utilisateur connecté
    user,

    // Alias pour compatibilité si certains fichiers
    // utilisent currentUser
    currentUser: user,

    // Permet de forcer le rafraîchissement de certains composants
    updateKey,

    // État de chargement
    loading,

    // Authentification
    login,
    logout,
    register,

    // Utilisateur
    setUser,
    setCurrentUser: setUser,
    updateUser,
    refreshUser,

    // Compte
    unlockAccount,

    // Mot de passe
    changePassword,
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

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth doit être utilisé à l’intérieur de AuthProvider'
    );
  }

  return context;
}

export default AuthContext;


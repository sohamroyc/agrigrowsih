
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, pass: string) => Promise<boolean>;
  updateProfile: (updatedUser: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database
const MOCK_USER_DB_KEY = 'agrigrow_users';
const MOCK_LOGGED_IN_USER_KEY = 'agrigrow_loggedin_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for a logged-in user in localStorage on initial load
    const storedUser = localStorage.getItem(MOCK_LOGGED_IN_USER_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = useCallback(async (email: string, pass: string): Promise<boolean> => {
    // In a real app, this would be an API call
    const users = JSON.parse(localStorage.getItem(MOCK_USER_DB_KEY) || '{}');
    if (users[email] && users[email].password === pass) {
      const loggedInUser = users[email].profile;
      setUser(loggedInUser);
      localStorage.setItem(MOCK_LOGGED_IN_USER_KEY, JSON.stringify(loggedInUser));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(MOCK_LOGGED_IN_USER_KEY);
  }, []);

  const register = useCallback(async (email: string, pass: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem(MOCK_USER_DB_KEY) || '{}');
    if (users[email]) {
      return false; // User already exists
    }
    const newUser: User = {
      id: `user_${Date.now()}`,
      email: email,
      name: '',
      age: '',
      gender: '',
      landSize: '',
      soilType: '',
      irrigationMethod: '',
      usualCrops: '',
      state: '',
      district: '',
    };
    users[email] = { password: pass, profile: newUser };
    localStorage.setItem(MOCK_USER_DB_KEY, JSON.stringify(users));
    setUser(newUser);
    localStorage.setItem(MOCK_LOGGED_IN_USER_KEY, JSON.stringify(newUser));
    return true;
  }, []);

  const updateProfile = useCallback((updatedUser: User) => {
    if (!user) return;
    const users = JSON.parse(localStorage.getItem(MOCK_USER_DB_KEY) || '{}');
    if (users[updatedUser.email]) {
      users[updatedUser.email].profile = updatedUser;
      localStorage.setItem(MOCK_USER_DB_KEY, JSON.stringify(users));
      setUser(updatedUser);
      localStorage.setItem(MOCK_LOGGED_IN_USER_KEY, JSON.stringify(updatedUser));
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
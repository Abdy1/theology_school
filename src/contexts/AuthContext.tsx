import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8081';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, phone_number: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isTeacher: () => boolean;
  isStudent: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('theology-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();

    const authenticatedUser: User = {
      id: String(data.id),
      email: data.email,
      name: data.name,
      role: data.role || 'student',
    };

    setUser(authenticatedUser);
    localStorage.setItem('theology-user', JSON.stringify(authenticatedUser));

    if (data.token) {
      localStorage.setItem('theology-token', data.token);
    }
  };

  const signup = async (email: string, password: string, name: string, phone_number: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, phoneNumber: phone_number }),
    });

    if (!response.ok) {
      throw new Error('Signup failed');
    }

    const data = await response.json();

    const authenticatedUser: User = {
      id: String(data.id),
      email: data.email,
      name: data.name,
      role: data.role || 'student',
    };

    setUser(authenticatedUser);
    localStorage.setItem('theology-user', JSON.stringify(authenticatedUser));

    if (data.token) {
      localStorage.setItem('theology-token', data.token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('theology-user');
    localStorage.removeItem('theology-token');
  };

  const hasRole = (role: string) => {
    return user?.role === role;
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isTeacher = () => {
    return user?.role === 'teacher';
  };

  const isStudent = () => {
    return user?.role === 'student';
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading, hasRole, isAdmin, isTeacher, isStudent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

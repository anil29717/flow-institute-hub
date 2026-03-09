import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/api/client';

type AppRole = 'owner' | 'teacher' | 'admin';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AppRole | null;
  instituteId: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile on mount if token exists
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('instiflow_auth_token');
      if (token) {
        try {
          const userData = await api.get('/auth/me');
          setUser({
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            instituteId: userData.instituteId
          });
        } catch (err) {
          console.error("Failed to fetch user:", err);
          localStorage.removeItem('instiflow_auth_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      // Save token
      localStorage.setItem('instiflow_auth_token', response.token);

      // Fetch user data right after login
      const userData = await api.get('/auth/me');
      setUser({
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        instituteId: userData.instituteId
      });

      return { error: null };
    } catch (err: any) {
      if (err.message === 'NO_ACTIVE_PLAN') {
        return { error: 'NO_ACTIVE_PLAN' };
      }
      return { error: err.message || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('instiflow_auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types/crm';

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: Record<UserRole, User> = {
  owner: { id: 'o1', email: 'owner@instiflow.com', role: 'owner', firstName: 'Aditya', lastName: 'Kapoor', isActive: true },
  teacher: { id: 't1', email: 'rajesh@instiflow.com', role: 'teacher', firstName: 'Rajesh', lastName: 'Kumar', isActive: true },
  student: { id: 's1', email: 'arjun@student.com', role: 'student', firstName: 'Arjun', lastName: 'Mehta', isActive: true },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole) => setUser(mockUsers[role]);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

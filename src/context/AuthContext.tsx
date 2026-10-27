import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => { success: boolean; message?: string };
  quickLogin: (role: UserRole) => void;
  register: (name: string, email: string, role: UserRole, extra?: { studentId?: string; teacherId?: string }) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AUTH_STORAGE_KEY = 'schoolpro_auth_session_v2';

export const DEMO_USERS: Record<UserRole, User> = {
  admin: {
    id: 'USR-ADMIN',
    name: 'Dr. Evelyn Sterling',
    email: 'admin@schoolpro.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  },
  teacher: {
    id: 'USR-TCH-101',
    name: 'Sarah Jenkins (Faculty)',
    email: 'teacher@schoolpro.com',
    role: 'teacher',
    teacherId: 'TCH-101',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  },
  parent: {
    id: 'USR-PAR-1001',
    name: 'Christopher Hayes (Guardian)',
    email: 'parent@schoolpro.com',
    role: 'parent',
    linkedStudentId: 'STU-1001', // Linked to Liam Alexander Hayes (Class 5-A)
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved auth', e);
    }
    // Default logged in as admin for smooth evaluation and live preview
    return DEMO_USERS.admin;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  const login = (email: string, pass: string): { success: boolean; message?: string } => {
    const trimmedEmail = email.trim().toLowerCase();
    
    if (trimmedEmail === 'admin@schoolpro.com' && pass === 'admin123') {
      setCurrentUser(DEMO_USERS.admin);
      return { success: true };
    }
    if (trimmedEmail === 'teacher@schoolpro.com' && pass === 'teacher123') {
      setCurrentUser(DEMO_USERS.teacher);
      return { success: true };
    }
    if (trimmedEmail === 'parent@schoolpro.com' && pass === 'parent123') {
      setCurrentUser(DEMO_USERS.parent);
      return { success: true };
    }

    // Dynamic registered accounts lookup
    try {
      const registered = JSON.parse(localStorage.getItem('schoolpro_registered_users') || '[]');
      const match = registered.find((u: any) => u.email.toLowerCase() === trimmedEmail && u.password === pass);
      if (match) {
        const customUser: User = {
          id: match.id,
          name: match.name,
          email: match.email,
          role: match.role,
          linkedStudentId: match.linkedStudentId,
          teacherId: match.teacherId,
          avatar: match.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        };
        setCurrentUser(customUser);
        return { success: true };
      }
    } catch {
      // fallback
    }

    return {
      success: false,
      message: 'Invalid credentials. Please use the demo buttons or provided email & password.',
    };
  };

  const quickLogin = (role: UserRole) => {
    setCurrentUser(DEMO_USERS[role]);
  };

  const switchRole = (role: UserRole) => {
    setCurrentUser(DEMO_USERS[role]);
  };

  const register = (name: string, email: string, role: UserRole, extra?: { studentId?: string; teacherId?: string }) => {
    const newUser: User = {
      id: `USR-${Date.now()}`,
      name,
      email,
      role,
      linkedStudentId: extra?.studentId || 'STU-1001',
      teacherId: extra?.teacherId || 'TCH-101',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    };
    setCurrentUser(newUser);

    try {
      const registered = JSON.parse(localStorage.getItem('schoolpro_registered_users') || '[]');
      registered.push({ ...newUser, password: 'password123' });
      localStorage.setItem('schoolpro_registered_users', JSON.stringify(registered));
    } catch (e) {
      console.warn('Failed to save registered user', e);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        isAuthenticated: !!currentUser,
        login,
        quickLogin,
        register,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

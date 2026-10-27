import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserRole } from '../../types';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login, quickLogin } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('admin@schoolpro.com');
  const [password, setPassword] = useState('admin123');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(email, password);
    if (res.success) {
      showToast('success', 'Authentication Successful', 'Logged in to SchoolPro dashboard.');
    } else {
      showToast('error', 'Login Failed', res.message || 'Invalid credentials.');
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    quickLogin(role);
    showToast('success', 'Demo Login', `Signed in under ${role.toUpperCase()} persona.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 mx-auto flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-amber-500/30">
          SP
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          SchoolPro Management System
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Free Web Development Internship Online Project Demo
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-8 shadow-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 text-xs">
          {/* Quick Login Pre-sets */}
          <div className="mb-6">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Instant 1-Click Demo Login
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-900/40 text-center transition-colors group"
              >
                <ShieldCheck className="w-5 h-5 mx-auto text-amber-600 mb-1" />
                <span className="font-bold text-slate-900 dark:text-white block">Admin</span>
                <span className="text-[10px] text-slate-400">Full Access</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('teacher')}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 text-center transition-colors group"
              >
                <UserCheck className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                <span className="font-bold text-slate-900 dark:text-white block">Teacher</span>
                <span className="text-[10px] text-slate-400">Classes & Roll</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('parent')}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 text-center transition-colors group"
              >
                <GraduationCap className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                <span className="font-bold text-slate-900 dark:text-white block">Parent</span>
                <span className="text-[10px] text-slate-400">Child Portal</span>
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="px-3 bg-white dark:bg-slate-900 text-slate-400 font-medium">
                Or sign in with credentials
              </span>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                  placeholder="admin@schoolpro.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                  placeholder="admin123"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-xs transition-colors"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Credentials Reference Box */}
          <div className="mt-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">Demo Credentials:</p>
            <p>Admin: <span className="font-mono text-amber-600">admin@schoolpro.com</span> / admin123</p>
            <p>Teacher: <span className="font-mono text-emerald-600">teacher@schoolpro.com</span> / teacher123</p>
            <p>Parent: <span className="font-mono text-blue-600">parent@schoolpro.com</span> / parent123</p>
          </div>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium"
            >
              Don't have an account? Register demo user &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

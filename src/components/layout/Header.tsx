import React, { useState } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Search,
  Bell,
  LogOut,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  X,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Student, Teacher, Announcement } from '../../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  announcements: Announcement[];
  students: Student[];
  teachers: Teacher[];
  onNavigate: (module: string) => void;
  onSelectStudent?: (student: Student) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isDark,
  onToggleDark,
  announcements,
  students,
  teachers,
  onNavigate,
  onSelectStudent,
}) => {
  const { currentUser, role, logout, switchRole } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Search filtering
  const filteredStudents = searchQuery.trim()
    ? students.filter(
        s =>
          s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `class ${s.classNum}`.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const filteredTeachers = searchQuery.trim()
    ? teachers.filter(
        t =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.subjects.some(sub => sub.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 4)
    : [];

  const getRoleIcon = () => {
    if (role === 'admin') return <ShieldCheck className="w-4 h-4 text-amber-500" />;
    if (role === 'teacher') return <UserCheck className="w-4 h-4 text-emerald-500" />;
    return <GraduationCap className="w-4 h-4 text-blue-500" />;
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Left zone: Mobile toggle + Breadcrumb / Brand mark */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-hidden"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-xs shadow-amber-500/20">
            SP
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-slate-900 dark:text-white tracking-tight">SchoolPro</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-2 font-mono">v2.0</span>
          </div>
        </div>
      </div>

      {/* Middle zone: Quick Universal Search */}
      <div className="flex-1 max-w-md mx-4 relative hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search students, teachers, ID (e.g. Liam, STU-1001)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && searchQuery.trim() && (
          <div
            className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-xs"
            onMouseLeave={() => setIsSearchOpen(false)}
          >
            {filteredStudents.length === 0 && filteredTeachers.length === 0 ? (
              <p className="p-3 text-slate-500 text-center">No matching students or teachers found.</p>
            ) : (
              <>
                {filteredStudents.length > 0 && (
                  <div className="mb-2">
                    <p className="px-2 py-1 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                      Students
                    </p>
                    {filteredStudents.map(stu => (
                      <button
                        key={stu.id}
                        onClick={() => {
                          onNavigate('students');
                          if (onSelectStudent) onSelectStudent(stu);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                      >
                        <div>
                          <span className="font-medium text-slate-900 dark:text-white">{stu.fullName}</span>
                          <span className="text-slate-400 ml-2 font-mono">
                            {stu.id} · Class {stu.classNum}-{stu.section}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}

                {filteredTeachers.length > 0 && (
                  <div>
                    <p className="px-2 py-1 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                      Faculty
                    </p>
                    {filteredTeachers.map(tch => (
                      <button
                        key={tch.id}
                        onClick={() => {
                          onNavigate('teachers');
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                      >
                        <div>
                          <span className="font-medium text-slate-900 dark:text-white">{tch.name}</span>
                          <span className="text-slate-400 ml-2 font-mono">{tch.id} · {tch.subjects.join(', ')}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Right zone: Theme toggle + Notifications + Role Switcher Demo + User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark/Light Mode Toggle */}
        <button
          onClick={onToggleDark}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Dark Mode"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
            title="School Announcements"
            aria-label="Announcements"
          >
            <Bell className="w-4 h-4" />
            {announcements.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95"
              onMouseLeave={() => setShowNotifications(false)}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-sm text-slate-900 dark:text-white">Announcements</span>
                <span className="text-xs text-slate-400">{announcements.length} notices</span>
              </div>
              <div className="mt-3 space-y-3 max-h-72 overflow-y-auto pr-1">
                {announcements.slice(0, 4).map(item => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors text-xs"
                  >
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.title}</span>
                      <span className="text-[10px] text-slate-400">{item.publicationDate}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 line-clamp-2">{item.message}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setShowNotifications(false);
                  onNavigate('communication');
                }}
                className="mt-3 w-full py-1.5 text-center text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 block rounded-lg border border-dashed border-amber-200 dark:border-amber-900/40"
              >
                View All Communication & Messages
              </button>
            </div>
          )}
        </div>

        {/* Demo Role Switcher Quick Pill */}
        <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
          <button
            onClick={() => switchRole('admin')}
            className={`px-2 py-1 rounded-md transition-colors ${
              role === 'admin'
                ? 'bg-amber-500 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => switchRole('teacher')}
            className={`px-2 py-1 rounded-md transition-colors ${
              role === 'teacher'
                ? 'bg-amber-500 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Teacher
          </button>
          <button
            onClick={() => switchRole('parent')}
            className={`px-2 py-1 rounded-md transition-colors ${
              role === 'parent'
                ? 'bg-amber-500 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Parent
          </button>
        </div>

        {/* User Profile display */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
            <div className="hidden sm:block text-left text-xs leading-tight">
              <p className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-slate-400 capitalize flex items-center gap-1">
                {getRoleIcon()}
                {currentUser.role}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors ml-1"
              title="Logout session"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

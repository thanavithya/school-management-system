import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Layers,
  CalendarCheck,
  FileSpreadsheet,
  CreditCard,
  Clock,
  MessageSquare,
  CalendarDays,
  BarChart3,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface SidebarProps {
  currentModule: string;
  onSelectModule: (module: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  allowedRoles: UserRole[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  isOpen,
  onClose,
}) => {
  const { role, logout } = useAuth();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      allowedRoles: ['admin', 'teacher', 'parent'],
    },
    {
      id: 'students',
      label: 'Students',
      icon: <Users className="w-4 h-4" />,
      allowedRoles: ['admin', 'teacher'],
    },
    {
      id: 'teachers',
      label: 'Teachers',
      icon: <GraduationCap className="w-4 h-4" />,
      allowedRoles: ['admin'],
    },
    {
      id: 'classes',
      label: 'Classes & Sections',
      icon: <Layers className="w-4 h-4" />,
      allowedRoles: ['admin', 'teacher'],
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: <CalendarCheck className="w-4 h-4" />,
      allowedRoles: ['admin', 'teacher', 'parent'],
    },
    {
      id: 'grades',
      label: 'Grades & Exams',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      allowedRoles: ['admin', 'teacher', 'parent'],
    },
    {
      id: 'fees',
      label: 'Fee Management',
      icon: <CreditCard className="w-4 h-4" />,
      allowedRoles: ['admin', 'parent'],
    },
    {
      id: 'timetable',
      label: 'Timetable',
      icon: <Clock className="w-4 h-4" />,
      allowedRoles: ['admin', 'teacher', 'parent'],
    },
    {
      id: 'communication',
      label: 'Communication',
      icon: <MessageSquare className="w-4 h-4" />,
      allowedRoles: ['admin', 'teacher', 'parent'],
    },
    {
      id: 'exams',
      label: 'Exam Schedule',
      icon: <CalendarDays className="w-4 h-4" />,
      allowedRoles: ['admin', 'teacher', 'parent'],
    },
    {
      id: 'reports',
      label: 'Reports Center',
      icon: <BarChart3 className="w-4 h-4" />,
      allowedRoles: ['admin', 'teacher'],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      allowedRoles: ['admin', 'teacher', 'parent'],
    },
  ];

  const visibleItems = navItems.filter(item => !role || item.allowedRoles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-amber-500/30">
              S
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-900 dark:text-white tracking-tight leading-none">
                SchoolPro
              </h1>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Smart Education OS</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Badge Indicator */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Current Role:</span>
            <span className="font-semibold capitalize text-amber-600 dark:text-amber-400">
              {role || 'Guest'}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {visibleItems.map(item => {
            const isActive = currentModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectModule(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer with Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

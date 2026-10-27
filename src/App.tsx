import React, { useState, useEffect, useCallback } from 'react';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StorageService } from './services/storage';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { StudentManagement } from './components/modules/StudentManagement';
import { TeacherManagement } from './components/modules/TeacherManagement';
import { ClassManagement } from './components/modules/ClassManagement';
import { AttendanceManagement } from './components/modules/AttendanceManagement';
import { GradeManagement } from './components/modules/GradeManagement';
import { FeeManagement } from './components/modules/FeeManagement';
import { TimetableManagement } from './components/modules/TimetableManagement';
import { CommunicationManagement } from './components/modules/CommunicationManagement';
import { ExamScheduleManagement } from './components/modules/ExamScheduleManagement';
import { ReportsCenter } from './components/modules/ReportsCenter';
import { SettingsManagement } from './components/modules/SettingsManagement';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import {
  Student,
  Teacher,
  ClassSection,
  AttendanceRecord,
  ExamSubjectMark,
  Examination,
  FeePayment,
  TimetableSlot,
  Announcement,
  ExamScheduleItem,
  SchoolProfile,
  AppDatabase,
} from './types';

function MainApp() {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  // Database State
  const [db, setDb] = useState<AppDatabase>(() => StorageService.load());

  // Active module navigation
  const [currentModule, setCurrentModule] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);

  // Auth toggle view
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // Dark mode
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('schoolpro_theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('schoolpro_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('schoolpro_theme', 'light');
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(prev => !prev);

  // Helper to persist database changes
  const updateDb = useCallback((updater: (prev: AppDatabase) => AppDatabase) => {
    setDb(prev => {
      const next = updater(prev);
      StorageService.save(next);
      return next;
    });
  }, []);

  // --- CRUD Handlers ---

  // Students
  const handleAddStudent = (student: Student) => {
    updateDb(prev => ({
      ...prev,
      students: [student, ...prev.students],
      activities: [
        {
          id: `ACT-${Date.now()}`,
          timestamp: 'Just now',
          title: `New student enrolled: ${student.fullName} (Class ${student.classNum}-${student.section})`,
          category: 'Registration',
        },
        ...prev.activities,
      ],
    }));
  };

  const handleUpdateStudent = (student: Student) => {
    updateDb(prev => ({
      ...prev,
      students: prev.students.map(s => (s.id === student.id ? student : s)),
    }));
  };

  const handleDeleteStudent = (id: string) => {
    updateDb(prev => ({
      ...prev,
      students: prev.students.filter(s => s.id !== id),
      attendance: prev.attendance.filter(a => a.studentId !== id),
      marks: prev.marks.filter(m => m.studentId !== id),
      feePayments: prev.feePayments.filter(f => f.studentId !== id),
    }));
  };

  // Teachers
  const handleAddTeacher = (teacher: Teacher) => {
    updateDb(prev => ({
      ...prev,
      teachers: [teacher, ...prev.teachers],
    }));
  };

  const handleUpdateTeacher = (teacher: Teacher) => {
    updateDb(prev => ({
      ...prev,
      teachers: prev.teachers.map(t => (t.id === teacher.id ? teacher : t)),
    }));
  };

  const handleDeleteTeacher = (id: string) => {
    updateDb(prev => ({
      ...prev,
      teachers: prev.teachers.filter(t => t.id !== id),
      classes: prev.classes.map(c => (c.classTeacherId === id ? { ...c, classTeacherId: '' } : c)),
    }));
  };

  // Classes
  const handleAddClass = (cls: ClassSection) => {
    updateDb(prev => ({
      ...prev,
      classes: [...prev.classes, cls],
    }));
  };

  const handleUpdateClass = (cls: ClassSection) => {
    updateDb(prev => ({
      ...prev,
      classes: prev.classes.map(c => (c.id === cls.id ? cls : c)),
    }));
  };

  const handleDeleteClass = (id: string) => {
    updateDb(prev => ({
      ...prev,
      classes: prev.classes.filter(c => c.id !== id),
    }));
  };

  // Attendance
  const handleSaveAttendance = (records: AttendanceRecord[]) => {
    updateDb(prev => {
      // Remove previous matching date + student records to prevent duplicates
      const targetIds = new Set(records.map(r => `${r.date}_${r.studentId}`));
      const filtered = prev.attendance.filter(a => !targetIds.has(`${a.date}_${a.studentId}`));
      return {
        ...prev,
        attendance: [...records, ...filtered],
        activities: [
          {
            id: `ACT-${Date.now()}`,
            timestamp: 'Just now',
            title: `Attendance marked for Class ${records[0]?.classNum}-${records[0]?.section}`,
            category: 'Attendance',
          },
          ...prev.activities,
        ],
      };
    });
  };

  // Grades / Marks
  const handleSaveMarks = (updatedMarks: ExamSubjectMark[]) => {
    updateDb(prev => ({
      ...prev,
      marks: updatedMarks,
      activities: [
        {
          id: `ACT-${Date.now()}`,
          timestamp: 'Just now',
          title: `Assessment marks updated by faculty`,
          category: 'Examination',
        },
        ...prev.activities,
      ],
    }));
  };

  const handleAddExamination = (exam: Examination) => {
    updateDb(prev => ({
      ...prev,
      examinations: [...prev.examinations, exam],
    }));
  };

  // Fees
  const handleRecordPayment = (payment: FeePayment) => {
    updateDb(prev => ({
      ...prev,
      feePayments: [payment, ...prev.feePayments],
      activities: [
        {
          id: `ACT-${Date.now()}`,
          timestamp: 'Just now',
          title: `Fee receipt #${payment.receiptNumber} (${prev.schoolProfile.currencySymbol}${payment.amountPaid}) recorded for ${payment.studentName}`,
          category: 'Fees',
        },
        ...prev.activities,
      ],
    }));
  };

  // Timetable
  const handleSaveSlot = (slot: TimetableSlot) => {
    updateDb(prev => {
      const idx = prev.timetable.findIndex(t => t.id === slot.id);
      let updated: TimetableSlot[];
      if (idx >= 0) {
        updated = [...prev.timetable];
        updated[idx] = slot;
      } else {
        updated = [...prev.timetable, slot];
      }
      return { ...prev, timetable: updated };
    });
  };

  const handleDeleteSlot = (id: string) => {
    updateDb(prev => ({
      ...prev,
      timetable: prev.timetable.filter(t => t.id !== id),
    }));
  };

  // Announcements
  const handleAddAnnouncement = (ann: Announcement) => {
    updateDb(prev => ({
      ...prev,
      announcements: [ann, ...prev.announcements],
      activities: [
        {
          id: `ACT-${Date.now()}`,
          timestamp: 'Just now',
          title: `New announcement: ${ann.title}`,
          category: 'Announcement',
        },
        ...prev.activities,
      ],
    }));
  };

  const handleDeleteAnnouncement = (id: string) => {
    updateDb(prev => ({
      ...prev,
      announcements: prev.announcements.filter(a => a.id !== id),
    }));
  };

  // Exam Schedules
  const handleSaveExamSchedule = (item: ExamScheduleItem) => {
    updateDb(prev => {
      const idx = prev.examSchedules.findIndex(s => s.id === item.id);
      let list: ExamScheduleItem[];
      if (idx >= 0) {
        list = [...prev.examSchedules];
        list[idx] = item;
      } else {
        list = [...prev.examSchedules, item];
      }
      return { ...prev, examSchedules: list };
    });
  };

  const handleDeleteExamSchedule = (id: string) => {
    updateDb(prev => ({
      ...prev,
      examSchedules: prev.examSchedules.filter(s => s.id !== id),
    }));
  };

  // School Profile & Settings
  const handleUpdateSchoolProfile = (profile: SchoolProfile) => {
    updateDb(prev => ({
      ...prev,
      schoolProfile: profile,
    }));
  };

  const handleResetDatabase = () => {
    const fresh = StorageService.reset();
    setDb(fresh);
  };

  const handleExportJSON = () => {
    const jsonStr = StorageService.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SchoolPro_Master_Database_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('info', 'Backup Exported', 'Full JSON database downloaded.');
  };

  const handleImportJSON = (jsonString: string): boolean => {
    const success = StorageService.importJSON(jsonString);
    if (success) {
      setDb(StorageService.load());
    }
    return success;
  };

  // Render Authentication screen if not logged in
  if (!isAuthenticated) {
    if (authView === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthView('register')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        currentModule={currentModule}
        onSelectModule={setCurrentModule}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header Bar */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          isDark={isDark}
          onToggleDark={toggleDarkMode}
          announcements={db.announcements}
          students={db.students}
          teachers={db.teachers}
          onNavigate={setCurrentModule}
          onSelectStudent={stu => {
            setSelectedStudentForView(stu);
            setCurrentModule('students');
          }}
        />

        {/* Content View */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentModule === 'dashboard' && (
            <DashboardView
              db={db}
              onNavigate={setCurrentModule}
              onOpenAddStudent={() => setCurrentModule('students')}
              onOpenQuickFee={() => setCurrentModule('fees')}
              onSelectStudent={stu => {
                setSelectedStudentForView(stu);
                setCurrentModule('students');
              }}
              isDark={isDark}
            />
          )}

          {currentModule === 'students' && (
            <StudentManagement
              students={db.students}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              selectedStudentFromSearch={selectedStudentForView}
              schoolProfile={db.schoolProfile}
            />
          )}

          {currentModule === 'teachers' && (
            <TeacherManagement
              teachers={db.teachers}
              onAddTeacher={handleAddTeacher}
              onUpdateTeacher={handleUpdateTeacher}
              onDeleteTeacher={handleDeleteTeacher}
            />
          )}

          {currentModule === 'classes' && (
            <ClassManagement
              classes={db.classes}
              teachers={db.teachers}
              students={db.students}
              onAddClass={handleAddClass}
              onUpdateClass={handleUpdateClass}
              onDeleteClass={handleDeleteClass}
            />
          )}

          {currentModule === 'attendance' && (
            <AttendanceManagement
              students={db.students}
              attendanceRecords={db.attendance}
              onSaveAttendance={handleSaveAttendance}
              schoolProfile={db.schoolProfile}
            />
          )}

          {currentModule === 'grades' && (
            <GradeManagement
              examinations={db.examinations}
              marks={db.marks}
              students={db.students}
              schoolProfile={db.schoolProfile}
              onSaveMarks={handleSaveMarks}
              onAddExamination={handleAddExamination}
            />
          )}

          {currentModule === 'fees' && (
            <FeeManagement
              students={db.students}
              feeStructures={db.feeStructures}
              feePayments={db.feePayments}
              schoolProfile={db.schoolProfile}
              onRecordPayment={handleRecordPayment}
              onUpdateFeeStructure={structures => updateDb(prev => ({ ...prev, feeStructures: structures }))}
            />
          )}

          {currentModule === 'timetable' && (
            <TimetableManagement
              timetable={db.timetable}
              teachers={db.teachers}
              schoolProfile={db.schoolProfile}
              onSaveSlot={handleSaveSlot}
              onDeleteSlot={handleDeleteSlot}
            />
          )}

          {currentModule === 'communication' && (
            <CommunicationManagement
              announcements={db.announcements}
              students={db.students}
              schoolProfile={db.schoolProfile}
              onAddAnnouncement={handleAddAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
            />
          )}

          {currentModule === 'exams' && (
            <ExamScheduleManagement
              examSchedules={db.examSchedules}
              examinations={db.examinations}
              schoolProfile={db.schoolProfile}
              onSaveSchedule={handleSaveExamSchedule}
              onDeleteSchedule={handleDeleteExamSchedule}
            />
          )}

          {currentModule === 'reports' && <ReportsCenter db={db} />}

          {currentModule === 'settings' && (
            <SettingsManagement
              schoolProfile={db.schoolProfile}
              onUpdateSchoolProfile={handleUpdateSchoolProfile}
              onResetDatabase={handleResetDatabase}
              onExportJSON={handleExportJSON}
              onImportJSON={handleImportJSON}
              isDark={isDark}
              onToggleDark={toggleDarkMode}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}

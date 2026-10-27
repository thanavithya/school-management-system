import React, { useMemo } from 'react';
import {
  Users,
  GraduationCap,
  Layers,
  CalendarCheck,
  CreditCard,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  FileText,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppDatabase, Student } from '../../types';
import { SchoolChart } from './SchoolChart';

interface DashboardViewProps {
  db: AppDatabase;
  onNavigate: (module: string) => void;
  onOpenAddStudent: () => void;
  onOpenQuickFee: () => void;
  onSelectStudent: (student: Student) => void;
  isDark: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  db,
  onNavigate,
  onOpenAddStudent,
  onOpenQuickFee,
  onSelectStudent,
  isDark,
}) => {
  const { role, currentUser } = useAuth();

  // Statistics Computations
  const stats = useMemo(() => {
    const totalStudents = db.students.length;
    const totalTeachers = db.teachers.length;
    const totalClasses = db.classes.length;

    // Today's Attendance
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = db.attendance.filter(a => a.date === today);
    const presentToday = todayRecords.filter(a => a.status === 'Present').length;
    const attendancePercentage =
      todayRecords.length > 0 ? Math.round((presentToday / todayRecords.length) * 100) : 94;

    // Fees calculation
    const totalFeesCollected = db.feePayments.reduce((acc, curr) => acc + curr.amountPaid, 0);

    // Approximate total fee expected across all students (avg fee structure: $720/student)
    const estimatedTotalFeeAssigned = db.students.length * 720;
    const pendingFees = Math.max(0, estimatedTotalFeeAssigned - totalFeesCollected);

    return {
      totalStudents,
      totalTeachers,
      totalClasses,
      attendancePercentage,
      totalFeesCollected,
      pendingFees,
    };
  }, [db]);

  // Chart 1: Attendance Distribution by Class (Classes 1 through 10)
  const attendanceChartData = useMemo(() => {
    const labels = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
    const rates = labels.map((_, idx) => {
      const clsNum = String(idx + 1);
      const clsRecords = db.attendance.filter(a => a.classNum === clsNum);
      if (clsRecords.length === 0) return 92; // default realistic benchmark
      const pres = clsRecords.filter(a => a.status === 'Present').length;
      return Math.round((pres / clsRecords.length) * 100);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Attendance Rate (%)',
          data: rates,
          backgroundColor: '#F59E0B',
          borderRadius: 6,
        },
      ],
    };
  }, [db.attendance]);

  // Chart 2: Monthly Fee Collection Trend
  const feeChartData = useMemo(() => {
    return {
      labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
      datasets: [
        {
          type: 'line' as const,
          label: 'Collected ($)',
          data: [1800, 2400, 3100, 4200, stats.totalFeesCollected, 0],
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.35,
        },
        {
          type: 'bar' as const,
          label: 'Target Budget ($)',
          data: [2000, 2500, 3000, 4000, 4500, 4500],
          backgroundColor: isDark ? '#334155' : '#E2E8F0',
          borderRadius: 6,
        },
      ],
    };
  }, [stats.totalFeesCollected, isDark]);

  // Specific Parent Linked Student
  const linkedStudent = useMemo(() => {
    if (role === 'parent' && currentUser?.linkedStudentId) {
      return db.students.find(s => s.id === currentUser.linkedStudentId) || db.students[0];
    }
    return db.students[0];
  }, [role, currentUser, db.students]);

  // Teacher specific assigned classes
  const teacherObj = useMemo(() => {
    if (role === 'teacher' && currentUser?.teacherId) {
      return db.teachers.find(t => t.id === currentUser.teacherId) || db.teachers[0];
    }
    return db.teachers[0];
  }, [role, currentUser, db.teachers]);

  // ================= ADMIN DASHBOARD =================
  if (role === 'admin') {
    return (
      <div className="space-y-6">
        {/* Top Header & Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Administrator Console
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Live operational metrics for {db.schoolProfile.name} · Academic Session {db.schoolProfile.academicYear}
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddStudent}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Student</span>
            </button>
            <button
              onClick={() => onNavigate('attendance')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 rounded-xl transition-colors"
            >
              <CalendarCheck className="w-4 h-4 text-emerald-500" />
              <span>Mark Attendance</span>
            </button>
            <button
              onClick={onOpenQuickFee}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 rounded-xl transition-colors"
            >
              <Receipt className="w-4 h-4 text-amber-500" />
              <span>Record Fee</span>
            </button>
          </div>
        </div>

        {/* 6 Key Performance Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Students</span>
              <Users className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-2">
              {stats.totalStudents}
            </p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center">
              Active Enrolled
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Faculty</span>
              <GraduationCap className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-2">
              {stats.totalTeachers}
            </p>
            <span className="text-[11px] text-slate-400 font-medium mt-1">Teaching Staff</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Classes</span>
              <Layers className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-2">
              {stats.totalClasses}
            </p>
            <span className="text-[11px] text-slate-400 font-medium mt-1">Class 1-10 (A,B,C)</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Today Attendance</span>
              <CalendarCheck className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-2">
              {stats.attendancePercentage}%
            </p>
            <span className="text-[11px] text-slate-400 font-medium mt-1">Daily turnout</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Collected Fees</span>
              <CreditCard className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-2">
              {db.schoolProfile.currencySymbol}{stats.totalFeesCollected.toLocaleString()}
            </p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">Realized</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Pending Dues</span>
              <AlertCircle className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400 mt-2">
              {db.schoolProfile.currencySymbol}{stats.pendingFees.toLocaleString()}
            </p>
            <span className="text-[11px] text-rose-500 font-medium mt-1">Estimated Outstanding</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Attendance Overview */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <span>Class-wise Attendance Overview</span>
                </h3>
                <p className="text-[11px] text-slate-400">Percentage distribution across Classes 1 to 10</p>
              </div>
              <button
                onClick={() => onNavigate('attendance')}
                className="text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1"
              >
                <span>Full Log</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <SchoolChart
              type="bar"
              data={attendanceChartData}
              options={{
                scales: {
                  y: {
                    min: 60,
                    max: 100,
                    ticks: {
                      callback: (v: number) => `${v}%`,
                      font: { family: "'JetBrains Mono', monospace", size: 10 },
                    },
                    grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
                  },
                  x: {
                    grid: { display: false },
                    ticks: { font: { size: 10 } },
                  },
                },
              }}
              height={230}
            />
          </div>

          {/* Chart 2: Fee Collections Trend */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  <span>Monthly Fee Collection Analytics</span>
                </h3>
                <p className="text-[11px] text-slate-400">Recorded collections vs fiscal benchmark targets</p>
              </div>
              <button
                onClick={() => onNavigate('fees')}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
              >
                <span>Fee Ledger</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <SchoolChart
              type="bar"
              data={feeChartData}
              options={{
                scales: {
                  y: {
                    ticks: {
                      callback: (v: number) => `$${v}`,
                      font: { family: "'JetBrains Mono', monospace", size: 10 },
                    },
                    grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
                  },
                  x: {
                    grid: { display: false },
                    ticks: { font: { size: 10 } },
                  },
                },
              }}
              height={230}
            />
          </div>
        </div>

        {/* Bottom Split: Recent Student Registrations & Live Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Registrations */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Recent Student Admissions</h3>
                <p className="text-[11px] text-slate-400">Newly enrolled pupils and assigned sections</p>
              </div>
              <button
                onClick={() => onNavigate('students')}
                className="text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
              >
                View All
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {db.students.slice(0, 5).map(student => (
                <div
                  key={student.id}
                  onClick={() => {
                    onSelectStudent(student);
                    onNavigate('students');
                  }}
                  className="py-3 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={student.photoUrl}
                      alt={student.fullName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <p className="font-medium text-xs text-slate-900 dark:text-white">{student.fullName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {student.id} · Class {student.classNum}-{student.section}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Adm: {student.admissionDate}
                    </span>
                    <p className="text-[11px] text-slate-400">{student.parentName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities Feed */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Recent System Activity</h3>
                <p className="text-[11px] text-slate-400">Audit trail of transactions, attendance & exams</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {db.activities.slice(0, 5).map(act => (
                <div key={act.id} className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="text-slate-800 dark:text-slate-200 font-medium leading-snug">{act.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span>{act.timestamp}</span>
                      <span>·</span>
                      <span className="text-amber-600 dark:text-amber-400 font-medium">{act.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= TEACHER DASHBOARD =================
  if (role === 'teacher') {
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-linear-to-r from-amber-500 to-amber-600 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-amber-100">Faculty Portal</span>
              <h1 className="text-2xl font-bold mt-1">Welcome back, {teacherObj.name}</h1>
              <p className="text-xs text-amber-100 mt-1">
                Assigned Subject Disciplines: {teacherObj.subjects.join(', ')} · Classes: {teacherObj.assignedClasses.join(', ')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('attendance')}
                className="px-4 py-2 bg-white text-slate-900 font-semibold text-xs rounded-xl shadow-xs hover:bg-amber-50 transition-colors"
              >
                Mark Class Attendance
              </button>
              <button
                onClick={() => onNavigate('grades')}
                className="px-4 py-2 bg-amber-700/60 hover:bg-amber-700 text-white font-medium text-xs rounded-xl transition-colors"
              >
                Enter Marks
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400">My Classes</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {teacherObj.assignedClasses.join(' · ')}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Daily instructional groups</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400">Upcoming Exams to Grade</span>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              Mid-Term Assessment 2026
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Class 5 Mathematics & Science</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400">Today Periods</span>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">4 Periods</p>
            <p className="text-[11px] text-slate-500 mt-1">Next: Period 3 (10:15 AM - Room 301)</p>
          </div>
        </div>

        {/* Timetable schedule for today */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Today's Instructional Schedule</span>
            </h3>
            <button
              onClick={() => onNavigate('timetable')}
              className="text-xs font-medium text-amber-600 hover:text-amber-700"
            >
              Full Timetable
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-amber-600">Period 1 · 08:30 - 09:15</span>
              <p className="font-semibold text-xs text-slate-900 dark:text-white mt-1">Mathematics</p>
              <p className="text-[11px] text-slate-500">Class 5-A · Room 301</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-amber-600">Period 2 · 09:15 - 10:00</span>
              <p className="font-semibold text-xs text-slate-900 dark:text-white mt-1">Mathematics Tutorial</p>
              <p className="text-[11px] text-slate-500">Class 6-A · Room 304</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-emerald-600">Period 4 · 11:00 - 11:45</span>
              <p className="font-semibold text-xs text-slate-900 dark:text-white mt-1">Statistics & Algebra</p>
              <p className="text-[11px] text-slate-500">Class 10-A · Room 504</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-blue-600">Period 6 · 01:15 - 02:00</span>
              <p className="font-semibold text-xs text-slate-900 dark:text-white mt-1">Remedial Doubts</p>
              <p className="text-[11px] text-slate-500">Faculty Room</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= PARENT DASHBOARD =================
  return (
    <div className="space-y-6">
      {/* Child Spotlight Banner */}
      <div className="p-6 rounded-2xl bg-linear-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={linkedStudent.photoUrl}
              alt={linkedStudent.fullName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/80 shadow-md"
            />
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-amber-100">Parent Portal</span>
              <h1 className="text-2xl font-bold">{linkedStudent.fullName}</h1>
              <p className="text-xs text-amber-100 mt-1 font-mono">
                Student ID: {linkedStudent.id} · Class {linkedStudent.classNum}-{linkedStudent.section} · Roll No. 04
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('grades')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-slate-900 font-semibold text-xs rounded-xl shadow-xs hover:bg-amber-50 transition-colors"
            >
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Report Card</span>
            </button>
            <button
              onClick={() => onNavigate('fees')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-800/60 hover:bg-amber-800 text-white font-medium text-xs rounded-xl transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay Fees</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards for Linked Child */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Attendance Ring */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Attendance Ratio</span>
            <CalendarCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">96.4%</span>
            <span className="text-xs text-slate-400">Present (54 of 56 Days)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Only 2 leaves recorded this term (Sick leave approved)</p>
        </div>

        {/* Academic Performance */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Latest Exam Result</span>
            <FileSpreadsheet className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-amber-600 dark:text-amber-400">A+</span>
            <span className="text-xs text-slate-400">Overall Grade (91.2%)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">First Term Exam 2026 · Class Rank 2 of 28</p>
        </div>

        {/* Fee Status */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Fee Clearance</span>
            <Receipt className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">$0.00</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">All Cleared</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Tuition, Transport, and Exam fees fully settled for Term 1</p>
        </div>
      </div>

      {/* Announcements for parents */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>School Announcements & Circulars</span>
          </h3>
          <button
            onClick={() => onNavigate('communication')}
            className="text-xs font-medium text-amber-600 hover:text-amber-700"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {db.announcements.slice(0, 2).map(ann => (
            <div
              key={ann.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold text-slate-900 dark:text-white">{ann.title}</span>
                <span className="text-[10px] text-slate-400">{ann.publicationDate}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mt-1">{ann.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

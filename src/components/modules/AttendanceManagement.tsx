import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Users,
  Download,
  Filter,
  Save,
  CheckCheck,
  History,
  FileSpreadsheet,
  TrendingUp,
} from 'lucide-react';
import { AttendanceRecord, Student, SchoolProfile } from '../../types';
import { useToast } from '../../context/ToastContext';
import { generateAttendanceReportPDF, exportToCSV } from '../../services/pdfExport';
import { useAuth } from '../../context/AuthContext';

interface AttendanceManagementProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onSaveAttendance: (records: AttendanceRecord[]) => void;
  schoolProfile: SchoolProfile;
}

export const AttendanceManagement: React.FC<AttendanceManagementProps> = ({
  students,
  attendanceRecords,
  onSaveAttendance,
  schoolProfile,
}) => {
  const { showToast } = useToast();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'mark' | 'history' | 'summary'>('mark');

  // Mark Form Filters
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState<string>('5');
  const [selectedSection, setSelectedSection] = useState<'A' | 'B' | 'C'>('A');

  // Local state for current attendance sheet
  const [currentStatuses, setCurrentStatuses] = useState<Record<string, 'Present' | 'Absent'>>({});

  // History Tab Filters
  const [historyClass, setHistoryClass] = useState('All');
  const [historySection, setHistorySection] = useState('All');
  const [historyDate, setHistoryDate] = useState('');
  const [historyStudentSearch, setHistoryStudentSearch] = useState('');

  // Map student IDs to Student objects
  const studentMap = useMemo(() => {
    const map: Record<string, Student> = {};
    students.forEach(s => {
      map[s.id] = s;
    });
    return map;
  }, [students]);

  // Students in selected class-section
  const classStudents = useMemo(() => {
    return students.filter(s => s.classNum === selectedClass && s.section === selectedSection);
  }, [students, selectedClass, selectedSection]);

  // Load existing statuses when date/class/section changes
  useMemo(() => {
    const existing = attendanceRecords.filter(
      r => r.date === selectedDate && r.classNum === selectedClass && r.section === selectedSection
    );
    const initial: Record<string, 'Present' | 'Absent'> = {};
    classStudents.forEach(s => {
      const match = existing.find(r => r.studentId === s.id);
      initial[s.id] = match ? match.status : 'Present'; // default to Present
    });
    setCurrentStatuses(initial);
  }, [attendanceRecords, selectedDate, selectedClass, selectedSection, classStudents]);

  const toggleStudentStatus = (studentId: string) => {
    setCurrentStatuses(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present',
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, 'Present' | 'Absent'> = {};
    classStudents.forEach(s => {
      updated[s.id] = 'Present';
    });
    setCurrentStatuses(updated);
    showToast('info', 'All Marked Present', `Set all ${classStudents.length} students to Present.`);
  };

  const handleSaveAttendance = () => {
    if (classStudents.length === 0) {
      showToast('warning', 'No Students', 'There are no students enrolled in this class-section.');
      return;
    }

    const newRecords: AttendanceRecord[] = classStudents.map(s => ({
      id: `ATT-${selectedDate}-${s.id}`,
      date: selectedDate,
      classNum: selectedClass,
      section: selectedSection,
      studentId: s.id,
      status: currentStatuses[s.id] || 'Present',
      markedBy: currentUser?.name || 'Administrator',
    }));

    onSaveAttendance(newRecords);
    showToast(
      'success',
      'Attendance Saved',
      `Attendance for Class ${selectedClass}-${selectedSection} on ${selectedDate} recorded.`
    );
  };

  // Calculations for current sheet
  const currentTotal = classStudents.length;
  const currentPresent = Object.values(currentStatuses).filter(s => s === 'Present').length;
  const currentAbsent = currentTotal - currentPresent;
  const currentPercentage = currentTotal > 0 ? Math.round((currentPresent / currentTotal) * 100) : 0;

  // History filtered records
  const filteredHistory = useMemo(() => {
    return attendanceRecords.filter(r => {
      const matchClass = historyClass === 'All' || r.classNum === historyClass;
      const matchSection = historySection === 'All' || r.section === historySection;
      const matchDate = !historyDate || r.date === historyDate;
      const stu = studentMap[r.studentId];
      const matchSearch =
        !historyStudentSearch ||
        r.studentId.toLowerCase().includes(historyStudentSearch.toLowerCase()) ||
        (stu && stu.fullName.toLowerCase().includes(historyStudentSearch.toLowerCase()));

      return matchClass && matchSection && matchDate && matchSearch;
    });
  }, [attendanceRecords, historyClass, historySection, historyDate, historyStudentSearch, studentMap]);

  // Class-wise summary calculations
  const classSummaryList = useMemo(() => {
    const list: { classNum: string; section: string; totalEnrolled: number; presentCount: number; rate: number }[] = [];
    const grouped = new Map<string, Student[]>();

    students.forEach(s => {
      const key = `${s.classNum}-${s.section}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(s);
    });

    grouped.forEach((stus, key) => {
      const [cNum, sec] = key.split('-');
      const records = attendanceRecords.filter(r => r.classNum === cNum && r.section === sec);
      const totalRecorded = records.length;
      const totalPresent = records.filter(r => r.status === 'Present').length;
      const rate = totalRecorded > 0 ? Math.round((totalPresent / totalRecorded) * 100) : 95;

      list.push({
        classNum: cNum,
        section: sec,
        totalEnrolled: stus.length,
        presentCount: totalPresent,
        rate,
      });
    });

    return list.sort((a, b) => parseInt(a.classNum) - parseInt(b.classNum));
  }, [students, attendanceRecords]);

  const handleExportPDF = () => {
    const activeSheetRecords: AttendanceRecord[] = classStudents.map(s => ({
      id: `ATT-${selectedDate}-${s.id}`,
      date: selectedDate,
      classNum: selectedClass,
      section: selectedSection,
      studentId: s.id,
      status: currentStatuses[s.id] || 'Present',
      markedBy: currentUser?.name || 'Administrator',
    }));

    generateAttendanceReportPDF(
      activeSheetRecords,
      studentMap,
      schoolProfile,
      selectedDate,
      selectedClass,
      selectedSection
    );
    showToast('info', 'PDF Generated', `Attendance report for Class ${selectedClass}-${selectedSection} exported.`);
  };

  const handleExportHistoryCSV = () => {
    const headers = ['Date', 'Student ID', 'Student Full Name', 'Class', 'Section', 'Status', 'Marked By'];
    const rows = filteredHistory.map(r => {
      const stu = studentMap[r.studentId];
      return [
        r.date,
        r.studentId,
        stu ? stu.fullName : r.studentId,
        r.classNum,
        r.section,
        r.status,
        r.markedBy || 'Staff',
      ];
    });
    exportToCSV(`Attendance_History_${new Date().toISOString().split('T')[0]}`, headers, rows);
    showToast('info', 'CSV Downloaded', 'Attendance log exported successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Daily Attendance Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track student attendance, mark rolls, review history, and calculate class ratios
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('mark')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'mark'
                ? 'bg-amber-500 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Mark Daily Roll
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'history'
                ? 'bg-amber-500 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Attendance Logs
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'summary'
                ? 'bg-amber-500 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Class Summary
          </button>
        </div>
      </div>

      {/* ================= TAB 1: MARK DAILY ROLL ================= */}
      {activeTab === 'mark' && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500">Date:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="bg-transparent font-medium text-slate-900 dark:text-white focus:outline-hidden font-mono"
                />
              </div>

              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Class:</span>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="bg-transparent font-medium text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                    <option key={c} value={String(c)}>
                      Class {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Section:</span>
                <select
                  value={selectedSection}
                  onChange={e => setSelectedSection(e.target.value as any)}
                  className="bg-transparent font-medium text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 rounded-xl transition-colors font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Present</span>
              </button>
              <button
                type="button"
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-medium"
              >
                <Download className="w-3.5 h-3.5 text-amber-500" />
                <span>PDF Report</span>
              </button>
              <button
                type="button"
                onClick={handleSaveAttendance}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Attendance</span>
              </button>
            </div>
          </div>

          {/* Turnout Stats Bar */}
          <div className="grid grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <span className="text-slate-500">Enrolled Students</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-base">{currentTotal}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Present Today</span>
              <span className="font-mono font-bold text-emerald-600 text-base">{currentPresent}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <span className="text-rose-600 dark:text-rose-400 font-medium">Absent</span>
              <span className="font-mono font-bold text-rose-600 text-base">{currentAbsent}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <span className="text-amber-600 dark:text-amber-400 font-medium">Turnout Percentage</span>
              <span className="font-mono font-bold text-amber-600 text-base">{currentPercentage}%</span>
            </div>
          </div>

          {/* Attendance Student Checklist */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-900 dark:text-white">
                Class {selectedClass}-{selectedSection} Student Roll Call ({classStudents.length} Students)
              </span>
              <span className="text-slate-400">Click row or status badge to toggle Present / Absent</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {classStudents.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No students currently enrolled in Class {selectedClass}-{selectedSection}.
                </div>
              ) : (
                classStudents.map((student, idx) => {
                  const status = currentStatuses[student.id] || 'Present';
                  const isPresent = status === 'Present';

                  return (
                    <div
                      key={student.id}
                      onClick={() => toggleStudentStatus(student.id)}
                      className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-400 w-5 text-center">{idx + 1}</span>
                        <img
                          src={student.photoUrl}
                          alt={student.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{student.fullName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {student.id} · Parent: {student.parentName} ({student.parentPhone})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            toggleStudentStatus(student.id);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                            isPresent
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'bg-rose-500 text-white shadow-xs'
                          }`}
                        >
                          {isPresent ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Present</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Absent</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ATTENDANCE HISTORY LOGS ================= */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* History Filters */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="text"
                placeholder="Search student or ID..."
                value={historyStudentSearch}
                onChange={e => setHistoryStudentSearch(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
              />

              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Class:</span>
                <select
                  value={historyClass}
                  onChange={e => setHistoryClass(e.target.value)}
                  className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden"
                >
                  <option value="All">All Classes</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                    <option key={c} value={String(c)}>
                      Class {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Date:</span>
                <input
                  type="date"
                  value={historyDate}
                  onChange={e => setHistoryDate(e.target.value)}
                  className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleExportHistoryCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-medium text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* History Log Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Class-Sec</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Audited By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No attendance history found for the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.slice(0, 50).map(rec => {
                      const stu = studentMap[rec.studentId];
                      return (
                        <tr
                          key={rec.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-2.5 px-4 font-mono text-slate-500">{rec.date}</td>
                          <td className="py-2.5 px-4 font-mono font-medium text-amber-600 dark:text-amber-400">
                            {rec.studentId}
                          </td>
                          <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-white">
                            {stu ? stu.fullName : rec.studentId}
                          </td>
                          <td className="py-2.5 px-4 font-mono">
                            Class {rec.classNum}-{rec.section}
                          </td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                                rec.status === 'Present'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                              }`}
                            >
                              {rec.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-400">{rec.markedBy || 'Staff'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: CLASS SUMMARY ================= */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classSummaryList.map(summary => (
            <div
              key={`${summary.classNum}-${summary.section}`}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Class {summary.classNum} - Section {summary.section}
                  </h3>
                  <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    {summary.rate}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Enrolled: {summary.totalEnrolled} Pupils</p>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all"
                    style={{ width: `${summary.rate}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Turnout index</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Healthy</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

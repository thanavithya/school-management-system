import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  Filter,
  Search,
  Users,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  FileText,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppDatabase } from '../../types';
import { exportToCSV, generateStudentListPDF } from '../../services/pdfExport';
import { useToast } from '../../context/ToastContext';

interface ReportsCenterProps {
  db: AppDatabase;
}

type ReportType =
  | 'student_list'
  | 'class_wise'
  | 'attendance'
  | 'marks'
  | 'fee_collection'
  | 'pending_fee'
  | 'teachers';

export const ReportsCenter: React.FC<ReportsCenterProps> = ({ db }) => {
  const { showToast } = useToast();

  const [activeReport, setActiveReport] = useState<ReportType>('student_list');
  const [filterClass, setFilterClass] = useState('All');
  const [filterStartDate, setFilterStartDate] = useState('2026-09-01');
  const [filterEndDate, setFilterEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const reportOptions: { id: ReportType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'student_list',
      label: 'Student Directory',
      icon: <Users className="w-4 h-4 text-amber-500" />,
      desc: 'Master enrollment roster with full guardian and address metadata',
    },
    {
      id: 'class_wise',
      label: 'Class-Wise Distribution',
      icon: <BarChart3 className="w-4 h-4 text-blue-500" />,
      desc: 'Section-by-section breakdown of pupil enrollment numbers',
    },
    {
      id: 'attendance',
      label: 'Attendance Audit',
      icon: <CalendarCheck className="w-4 h-4 text-emerald-500" />,
      desc: 'Attendance logs, present ratios, and student turnout rates',
    },
    {
      id: 'marks',
      label: 'Exam & Grades Report',
      icon: <FileSpreadsheet className="w-4 h-4 text-amber-500" />,
      desc: 'Assessment marks, percentage distributions, and letter grades',
    },
    {
      id: 'fee_collection',
      label: 'Fee Collections Log',
      icon: <CreditCard className="w-4 h-4 text-emerald-500" />,
      desc: 'Cleared fiscal collections, receipts and payment methods',
    },
    {
      id: 'pending_fee',
      label: 'Pending Dues Ledger',
      icon: <FileText className="w-4 h-4 text-rose-500" />,
      desc: 'List of students with outstanding tuition and auxiliary balances',
    },
    {
      id: 'teachers',
      label: 'Faculty & Subject Report',
      icon: <GraduationCap className="w-4 h-4 text-purple-500" />,
      desc: 'Instructor qualifications, disciplines, and assigned classes',
    },
  ];

  // Helper calculations for reports
  const studentMap = useMemo(() => {
    const map: Record<string, any> = {};
    db.students.forEach(s => (map[s.id] = s));
    return map;
  }, [db.students]);

  // Dynamic Report Data based on activeReport
  const reportData = useMemo(() => {
    if (activeReport === 'student_list') {
      const rows = db.students.filter(s => {
        const matchClass = filterClass === 'All' || s.classNum === filterClass;
        const matchSearch =
          s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchClass && matchSearch;
      });
      return {
        title: 'Comprehensive Student Enrollment Register',
        headers: ['ID', 'Full Name', 'Class-Sec', 'Gender', 'Parent Name', 'Parent Contact', 'Admission Date'],
        rows: rows.map(s => [s.id, s.fullName, `Class ${s.classNum}-${s.section}`, s.gender, s.parentName, s.parentPhone, s.admissionDate]),
        totalCount: rows.length,
      };
    }

    if (activeReport === 'class_wise') {
      const classMap: Record<string, number> = {};
      db.students.forEach(s => {
        const key = `Class ${s.classNum}-${s.section}`;
        classMap[key] = (classMap[key] || 0) + 1;
      });
      const rows = Object.entries(classMap)
        .filter(([cls]) => filterClass === 'All' || cls.includes(`Class ${filterClass}-`))
        .map(([cls, count]) => [cls, count, `${Math.round((count / db.students.length) * 100)}% of School`]);
      return {
        title: 'Class & Section Student Enrollment Breakdown',
        headers: ['Class & Section', 'Enrolled Pupils', 'Enrollment Share'],
        rows,
        totalCount: rows.length,
      };
    }

    if (activeReport === 'attendance') {
      const records = db.attendance.filter(r => {
        const matchClass = filterClass === 'All' || r.classNum === filterClass;
        const matchDate = (!filterStartDate || r.date >= filterStartDate) && (!filterEndDate || r.date <= filterEndDate);
        const stu = studentMap[r.studentId];
        const matchSearch =
          !searchQuery ||
          r.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (stu && stu.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchClass && matchDate && matchSearch;
      });
      return {
        title: 'Institutional Student Attendance Audit',
        headers: ['Date', 'Student ID', 'Student Full Name', 'Class-Sec', 'Turnout Status', 'Marked By'],
        rows: records.map(r => {
          const stu = studentMap[r.studentId];
          return [r.date, r.studentId, stu ? stu.fullName : r.studentId, `Class ${r.classNum}-${r.section}`, r.status, r.markedBy || 'Staff'];
        }),
        totalCount: records.length,
      };
    }

    if (activeReport === 'marks') {
      const records = db.marks.filter(m => {
        const matchClass = filterClass === 'All' || m.classNum === filterClass;
        const stu = studentMap[m.studentId];
        const matchSearch =
          !searchQuery ||
          m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (stu && stu.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchClass && matchSearch;
      });
      return {
        title: 'Academic Marks & Letter Grade Report',
        headers: ['Student ID', 'Student Name', 'Class-Sec', 'Subject', 'Max Marks', 'Obtained', 'Percentage', 'Grade'],
        rows: records.map(m => {
          const stu = studentMap[m.studentId];
          const pct = Math.round((m.obtainedMarks / m.maxMarks) * 100);
          return [m.studentId, stu ? stu.fullName : m.studentId, `Class ${m.classNum}-${m.section}`, m.subject, m.maxMarks, m.obtainedMarks, `${pct}%`, m.grade];
        }),
        totalCount: records.length,
      };
    }

    if (activeReport === 'fee_collection') {
      const records = db.feePayments.filter(p => {
        const matchClass = filterClass === 'All' || p.classNum === filterClass;
        const matchDate = (!filterStartDate || p.paymentDate >= filterStartDate) && (!filterEndDate || p.paymentDate <= filterEndDate);
        const matchSearch = !searchQuery || p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || p.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase());
        return matchClass && matchDate && matchSearch;
      });
      const totalAmt = records.reduce((sum, p) => sum + p.amountPaid, 0);
      return {
        title: `Fee Collection Fiscal Log (Total: ${db.schoolProfile.currencySymbol}${totalAmt.toLocaleString()})`,
        headers: ['Receipt #', 'Date', 'Student ID', 'Student Name', 'Class-Sec', 'Category', 'Method', 'Amount'],
        rows: records.map(p => [p.receiptNumber, p.paymentDate, p.studentId, p.studentName, `Class ${p.classNum}-${p.section}`, p.category, p.paymentMethod, `${db.schoolProfile.currencySymbol}${p.amountPaid.toFixed(2)}`]),
        totalCount: records.length,
      };
    }

    if (activeReport === 'pending_fee') {
      const rows: any[] = [];
      db.students.forEach(s => {
        if (filterClass !== 'All' && s.classNum !== filterClass) return;
        const matchSearch = !searchQuery || s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchSearch) return;

        const payments = db.feePayments.filter(p => p.studentId === s.id);
        const paid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
        const assigned = 720;
        const balance = Math.max(0, assigned - paid);

        if (balance > 0) {
          rows.push([
            s.id,
            s.fullName,
            `Class ${s.classNum}-${s.section}`,
            s.parentName,
            s.parentPhone,
            `${db.schoolProfile.currencySymbol}${assigned.toFixed(2)}`,
            `${db.schoolProfile.currencySymbol}${paid.toFixed(2)}`,
            `${db.schoolProfile.currencySymbol}${balance.toFixed(2)}`,
          ]);
        }
      });
      return {
        title: 'Outstanding Fee Dues Ledger',
        headers: ['Student ID', 'Student Name', 'Class-Sec', 'Parent Name', 'Parent Contact', 'Total Fee', 'Amount Paid', 'Outstanding Due'],
        rows,
        totalCount: rows.length,
      };
    }

    // Teachers Report
    const teachers = db.teachers.filter(t => {
      return !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.subjects.some(sub => sub.toLowerCase().includes(searchQuery.toLowerCase()));
    });
    return {
      title: 'Teaching Faculty Directory & Course Load',
      headers: ['Faculty ID', 'Instructor Name', 'Academic Qualification', 'Teaching Subjects', 'Assigned Classes', 'Contact Phone', 'Joining Date'],
      rows: teachers.map(t => [t.id, t.name, t.qualification, t.subjects.join(', '), t.assignedClasses.join(', '), t.phone, t.joiningDate]),
      totalCount: teachers.length,
    };
  }, [activeReport, db, filterClass, filterStartDate, filterEndDate, searchQuery, studentMap]);

  const handleExportCSV = () => {
    exportToCSV(`SchoolPro_Report_${activeReport}_${new Date().toISOString().split('T')[0]}`, reportData.headers, reportData.rows);
    showToast('info', 'CSV Generated', 'Report downloaded successfully as CSV.');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    doc.setFontSize(16);
    doc.setTextColor(245, 158, 11);
    doc.text(db.schoolProfile.name, 14, 16);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`${db.schoolProfile.address} | Official Institutional Report`, 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(reportData.title, 14, 28);
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated on ${new Date().toLocaleString()} · Filter: Class ${filterClass}`, 14, 33);

    autoTable(doc, {
      head: [reportData.headers],
      body: reportData.rows,
      startY: 38,
      theme: 'grid',
      headStyles: {
        fillColor: [31, 41, 55],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 14, right: 14 },
    });

    doc.save(`Report_${activeReport}_${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('info', 'PDF Generated', 'Report compiled and downloaded as PDF.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Reports & Analytics Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate and export live institutional reports in CSV or formal PDF format
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-xl font-medium text-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-xl font-medium text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Reports Grid Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {reportOptions.map(opt => {
          const isActive = activeReport === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setActiveReport(opt.id)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                isActive
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-400/60'
              }`}
            >
              <div className={isActive ? 'text-white' : 'text-slate-400'}>{opt.icon}</div>
              <p className="font-bold text-xs mt-2 leading-tight">{opt.label}</p>
            </button>
          );
        })}
      </div>

      {/* Filter and Query Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search within report rows..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500">Class:</span>
            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Classes</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                <option key={c} value={String(c)}>
                  Class {c}
                </option>
              ))}
            </select>
          </div>

          {(activeReport === 'attendance' || activeReport === 'fee_collection') && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500">From:</span>
              <input
                type="date"
                value={filterStartDate}
                onChange={e => setFilterStartDate(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white text-xs"
              />
              <span className="text-slate-500">To:</span>
              <input
                type="date"
                value={filterEndDate}
                onChange={e => setFilterEndDate(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white text-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* Live Report Preview Table */}
      <div className="print-container bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{reportData.title}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live preview · {reportData.totalCount} records matched
            </p>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">
            Generated: {new Date().toLocaleDateString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                {reportData.headers.map((h, i) => (
                  <th key={i} className="py-3 px-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {reportData.rows.length === 0 ? (
                <tr>
                  <td colSpan={reportData.headers.length} className="py-12 text-center text-slate-400">
                    No records found for the applied filter criteria.
                  </td>
                </tr>
              ) : (
                reportData.rows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {row.map((cell: any, cIdx: number) => (
                      <td key={cIdx} className="py-2.5 px-4">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

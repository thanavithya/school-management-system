import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Receipt,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  DollarSign,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import {
  FeePayment,
  ClassFeeStructure,
  Student,
  SchoolProfile,
  FeeCategory,
} from '../../types';
import { useToast } from '../../context/ToastContext';
import { generateFeeReceiptPDF, exportToCSV } from '../../services/pdfExport';

interface FeeManagementProps {
  students: Student[];
  feeStructures: ClassFeeStructure[];
  feePayments: FeePayment[];
  schoolProfile: SchoolProfile;
  onRecordPayment: (payment: FeePayment) => void;
  onUpdateFeeStructure: (structures: ClassFeeStructure[]) => void;
}

export const FeeManagement: React.FC<FeeManagementProps> = ({
  students,
  feeStructures,
  feePayments,
  schoolProfile,
  onRecordPayment,
  onUpdateFeeStructure,
}) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'roster' | 'payments' | 'structure'>('roster');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Partial' | 'Pending'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStudentId, setPaymentStudentId] = useState(students[0]?.id || '');
  const [paymentCategory, setPaymentCategory] = useState<FeeCategory>('Tuition Fee');
  const [paymentAmount, setPaymentAmount] = useState<number>(450);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer'>('UPI');
  const [paymentNotes, setPaymentNotes] = useState('Cleared via online transfer');

  // Receipt Preview Modal
  const [activeReceipt, setActiveReceipt] = useState<FeePayment | null>(null);

  const categories: FeeCategory[] = ['Tuition Fee', 'Transport Fee', 'Library Fee', 'Sports Fee', 'Examination Fee'];

  const studentMap = useMemo(() => {
    const map: Record<string, Student> = {};
    students.forEach(s => {
      map[s.id] = s;
    });
    return map;
  }, [students]);

  // Compute total assigned fee per class
  const classTotalFeeMap = useMemo(() => {
    const map: Record<string, number> = {};
    feeStructures.forEach(fs => {
      map[fs.classNum] = (map[fs.classNum] || 0) + fs.amount;
    });
    return map;
  }, [feeStructures]);

  // Aggregate payments by student
  const studentLedger = useMemo(() => {
    return students.map(student => {
      // Find payments for this student
      const payments = feePayments.filter(p => p.studentId === student.id);
      const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);

      // Fee assigned for student's class (default standard is $720 if not specified)
      const assigned = classTotalFeeMap[student.classNum] || 720;
      const balance = Math.max(0, assigned - totalPaid);

      let status: 'Paid' | 'Partial' | 'Pending' = 'Pending';
      if (totalPaid >= assigned) {
        status = 'Paid';
      } else if (totalPaid > 0) {
        status = 'Partial';
      }

      return {
        student,
        assigned,
        totalPaid,
        balance,
        status,
        lastPayment: payments[payments.length - 1],
      };
    });
  }, [students, feePayments, classTotalFeeMap]);

  // Filtered Student Fee List
  const filteredLedger = useMemo(() => {
    return studentLedger.filter(item => {
      const matchSearch =
        item.student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.student.parentName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchClass = classFilter === 'All' || item.student.classNum === classFilter;
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchSearch && matchClass && matchStatus;
    });
  }, [studentLedger, searchQuery, classFilter, statusFilter]);

  // Filtered Payments History
  const filteredPayments = useMemo(() => {
    return feePayments.filter(p => {
      const matchSearch =
        p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchClass = classFilter === 'All' || p.classNum === classFilter;
      const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
      return matchSearch && matchClass && matchCat;
    });
  }, [feePayments, searchQuery, classFilter, categoryFilter]);

  // Open Payment modal for specific student
  const handleOpenPaymentForStudent = (studentId: string) => {
    setPaymentStudentId(studentId);
    const item = studentLedger.find(l => l.student.id === studentId);
    const suggested = item ? Math.min(item.balance, 450) : 450;
    setPaymentAmount(suggested > 0 ? suggested : 100);
    setPaymentCategory('Tuition Fee');
    setPaymentMethod('UPI');
    setPaymentNotes('');
    setIsPaymentModalOpen(true);
  };

  // Submit payment with strict overpayment protection
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const student = studentMap[paymentStudentId];
    if (!student) {
      showToast('error', 'Student Missing', 'Invalid student selected.');
      return;
    }

    const item = studentLedger.find(l => l.student.id === student.id);
    const outstanding = item ? item.balance : 720;

    if (paymentAmount <= 0) {
      showToast('error', 'Invalid Amount', 'Payment amount must be greater than zero.');
      return;
    }

    // STRICT VALIDATION: Prevent payments greater than outstanding balance!
    if (paymentAmount > outstanding) {
      showToast(
        'error',
        'Overpayment Prevented',
        `Cannot record ${schoolProfile.currencySymbol}${paymentAmount}. The student's outstanding balance is only ${schoolProfile.currencySymbol}${outstanding}.`
      );
      return;
    }

    const nextReceiptNum = `REC-${new Date().getFullYear()}-${String(feePayments.length + 1).padStart(3, '0')}`;

    const newPayment: FeePayment = {
      id: `PAY-${Date.now()}`,
      receiptNumber: nextReceiptNum,
      studentId: student.id,
      studentName: student.fullName,
      classNum: student.classNum,
      section: student.section,
      category: paymentCategory,
      amountPaid: paymentAmount,
      paymentMethod,
      paymentDate: new Date().toISOString().split('T')[0],
      notes: paymentNotes || 'Fee payment recorded at finance office',
    };

    onRecordPayment(newPayment);
    showToast(
      'success',
      'Payment Recorded',
      `Receipt ${newPayment.receiptNumber} issued for ${student.fullName} (${schoolProfile.currencySymbol}${paymentAmount}).`
    );
    setIsPaymentModalOpen(false);
    setActiveReceipt(newPayment);
  };

  const handleDownloadReceiptPDF = (payment: FeePayment) => {
    const student = studentMap[payment.studentId];
    const item = studentLedger.find(l => l.student.id === payment.studentId);
    const assigned = item ? item.assigned : 720;
    const paid = item ? item.totalPaid : payment.amountPaid;

    generateFeeReceiptPDF(payment, student, schoolProfile, assigned, paid);
    showToast('info', 'PDF Receipt Exported', `Downloaded receipt ${payment.receiptNumber}.`);
  };

  const handleExportPaymentsCSV = () => {
    const headers = ['Receipt #', 'Date', 'Student ID', 'Student Name', 'Class', 'Category', 'Amount Paid', 'Method', 'Notes'];
    const rows = filteredPayments.map(p => [
      p.receiptNumber,
      p.paymentDate,
      p.studentId,
      p.studentName,
      `${p.classNum}-${p.section}`,
      p.category,
      p.amountPaid,
      p.paymentMethod,
      p.notes || '',
    ]);
    exportToCSV(`Fee_Payments_Report_${new Date().toISOString().split('T')[0]}`, headers, rows);
    showToast('info', 'CSV Downloaded', 'Fee transactions exported.');
  };

  // Top summary totals
  const totalAssignedAll = useMemo(() => studentLedger.reduce((sum, item) => sum + item.assigned, 0), [studentLedger]);
  const totalCollectedAll = useMemo(() => studentLedger.reduce((sum, item) => sum + item.totalPaid, 0), [studentLedger]);
  const totalPendingAll = Math.max(0, totalAssignedAll - totalCollectedAll);

  return (
    <div className="space-y-6">
      {/* Title & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Fee Management & Receipts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Collect school fees, print thermal-ready receipts, track student balances and fiscal ledgers
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'roster'
                  ? 'bg-amber-500 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Student Fee Dues
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'payments'
                  ? 'bg-amber-500 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Receipts History
            </button>
            <button
              onClick={() => setActiveTab('structure')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'structure'
                  ? 'bg-amber-500 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Fee Structures
            </button>
          </div>

          <button
            onClick={() => handleOpenPaymentForStudent(students[0]?.id || '')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Collect Fee</span>
          </button>
        </div>
      </div>

      {/* 3 Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Total Enrolled Assessment</span>
            <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
              {schoolProfile.currencySymbol}{totalAssignedAll.toLocaleString()}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Total Collected Realized</span>
            <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {schoolProfile.currencySymbol}{totalCollectedAll.toLocaleString()}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Total Outstanding Balance</span>
            <p className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
              {schoolProfile.currencySymbol}{totalPendingAll.toLocaleString()}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ================= TAB 1: STUDENT FEE DUES ================= */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex-1 min-w-[220px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name, ID, or parent..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Class:</span>
                <select
                  value={classFilter}
                  onChange={e => setClassFilter(e.target.value)}
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
                <span className="text-slate-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden"
                >
                  <option value="All">All Statuses</option>
                  <option value="Paid">Fully Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Class-Sec</th>
                    <th className="py-3 px-4">Assigned Fees</th>
                    <th className="py-3 px-4">Total Paid</th>
                    <th className="py-3 px-4">Balance Due</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                  {filteredLedger.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No students found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLedger.map(item => {
                      let badge = (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                          Pending
                        </span>
                      );
                      if (item.status === 'Paid') {
                        badge = (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                            Paid
                          </span>
                        );
                      } else if (item.status === 'Partial') {
                        badge = (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                            Partial
                          </span>
                        );
                      }

                      return (
                        <tr
                          key={item.student.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono font-medium text-amber-600 dark:text-amber-400">
                            {item.student.id}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-slate-900 dark:text-white">{item.student.fullName}</p>
                            <p className="text-[11px] text-slate-400">{item.student.parentName}</p>
                          </td>
                          <td className="py-3 px-4 font-mono">
                            Class {item.student.classNum}-{item.student.section}
                          </td>
                          <td className="py-3 px-4 font-mono tabular-nums text-slate-500">
                            {schoolProfile.currencySymbol}{item.assigned.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                            {schoolProfile.currencySymbol}{item.totalPaid.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                            {schoolProfile.currencySymbol}{item.balance.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">{badge}</td>
                          <td className="py-3 px-4 text-right">
                            {item.balance > 0 ? (
                              <button
                                onClick={() => handleOpenPaymentForStudent(item.student.id)}
                                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs transition-colors shadow-xs"
                              >
                                Record Pay
                              </button>
                            ) : (
                              <span className="text-slate-400 text-xs italic">All Clear</span>
                            )}
                          </td>
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

      {/* ================= TAB 2: RECEIPTS HISTORY ================= */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search receipt #, student name, or ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPaymentsCSV}
                className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-xl font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4 text-right">Receipt Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        No receipts found.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map(p => (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {p.receiptNumber}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">{p.paymentDate}</td>
                        <td className="py-3 px-4 font-mono text-amber-600 dark:text-amber-400">{p.studentId}</td>
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{p.studentName}</td>
                        <td className="py-3 px-4 font-mono">
                          Class {p.classNum}-{p.section}
                        </td>
                        <td className="py-3 px-4">{p.category}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {schoolProfile.currencySymbol}{p.amountPaid.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium text-[11px]">
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setActiveReceipt(p)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center gap-1"
                            >
                              <Receipt className="w-3.5 h-3.5 text-amber-500" />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => handleDownloadReceiptPDF(p)}
                              className="p-1 rounded-lg text-slate-400 hover:text-amber-600"
                              title="Download PDF Receipt"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: FEE STRUCTURES ================= */}
      {activeTab === 'structure' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between text-xs">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active Class Fee Schedules</h3>
              <p className="text-slate-400 mt-0.5">Assigned rates across categories for Classes 1 through 10</p>
            </div>
            <span className="font-mono text-slate-400">{feeStructures.length} Structures active</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {feeStructures.map(fs => (
              <div
                key={fs.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">Class {fs.classNum}</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 font-semibold text-[10px]">
                      {fs.frequency}
                    </span>
                  </div>
                  <h4 className="font-medium text-xs text-slate-700 dark:text-slate-300 mt-2">{fs.category}</h4>
                  <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                    {schoolProfile.currencySymbol}{fs.amount.toFixed(2)}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                  Standard curriculum charge
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Record Fee Payment</h2>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6 space-y-4">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Enrolled Student <span className="text-rose-500">*</span>
                </label>
                <select
                  value={paymentStudentId}
                  onChange={e => {
                    setPaymentStudentId(e.target.value);
                    const item = studentLedger.find(l => l.student.id === e.target.value);
                    if (item) setPaymentAmount(Math.min(item.balance, 450) || 100);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                >
                  {students.map(s => {
                    const item = studentLedger.find(l => l.student.id === s.id);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.id} - Class {s.classNum}-{s.section}) - Due: {schoolProfile.currencySymbol}
                        {item ? item.balance : 0}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Fee Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={paymentCategory}
                  onChange={e => setPaymentCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Payment Amount ({schoolProfile.currencySymbol}) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm focus:outline-hidden"
                />
                {(() => {
                  const item = studentLedger.find(l => l.student.id === paymentStudentId);
                  const bal = item ? item.balance : 0;
                  return (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Max outstanding balance:{' '}
                      <strong className="text-amber-600 font-mono">
                        {schoolProfile.currencySymbol}{bal.toFixed(2)}
                      </strong>
                    </p>
                  );
                })()}
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method (Demo)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'Cash', 'Bank Transfer'] as const).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                        paymentMethod === method
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Notes / Reference
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                  placeholder="e.g. Reference #UPI-99281920 or Counter Slip"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl shadow-xs"
                >
                  Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE RECEIPT MODAL */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-amber-500/30 overflow-hidden text-xs">
            <div className="p-6 bg-linear-to-r from-amber-500 to-amber-600 text-white relative">
              <button
                onClick={() => setActiveReceipt(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-100">
                SchoolPro Verified Receipt
              </span>
              <h3 className="text-xl font-bold mt-1">{schoolProfile.name}</h3>
              <p className="text-amber-100 text-[11px]">{schoolProfile.address}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 text-[10px]">Receipt Number</span>
                  <p className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                    {activeReceipt.receiptNumber}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px]">Payment Date</span>
                  <p className="font-mono text-slate-700 dark:text-slate-300">{activeReceipt.paymentDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 text-[10px]">Student Name</span>
                  <p className="font-bold text-slate-900 dark:text-white">{activeReceipt.studentName}</p>
                  <p className="font-mono text-slate-400 text-[11px]">{activeReceipt.studentId}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Class & Section</span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    Class {activeReceipt.classNum}-{activeReceipt.section}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{activeReceipt.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{activeReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-sm">
                  <span className="text-slate-900 dark:text-white">Amount Paid:</span>
                  <span className="text-emerald-600 font-mono">
                    {schoolProfile.currencySymbol}{activeReceipt.amountPaid.toFixed(2)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                Notes: {activeReceipt.notes || 'No remarks recorded.'}
              </p>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleDownloadReceiptPDF(activeReceipt)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Receipt</span>
                </button>
                <button
                  onClick={() => setActiveReceipt(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

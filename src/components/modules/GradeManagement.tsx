import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Printer,
  Download,
  Filter,
  Eye,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Award,
} from 'lucide-react';
import { Examination, ExamSubjectMark, Student, SchoolProfile } from '../../types';
import { useToast } from '../../context/ToastContext';
import { generateStudentReportCardPDF, exportToCSV } from '../../services/pdfExport';

interface GradeManagementProps {
  examinations: Examination[];
  marks: ExamSubjectMark[];
  students: Student[];
  schoolProfile: SchoolProfile;
  onSaveMarks: (updatedMarks: ExamSubjectMark[]) => void;
  onAddExamination: (exam: Examination) => void;
}

export const GradeManagement: React.FC<GradeManagementProps> = ({
  examinations,
  marks,
  students,
  schoolProfile,
  onSaveMarks,
  onAddExamination,
}) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'marks' | 'reportcard' | 'exams'>('marks');

  // Filters
  const [selectedExamId, setSelectedExamId] = useState<string>(examinations[0]?.id || 'EXAM-2026-T1');
  const [selectedClass, setSelectedClass] = useState<string>('5');
  const [selectedSection, setSelectedSection] = useState<'All' | 'A' | 'B' | 'C'>('A');
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');

  // New Exam Modal
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [newExamYear, setNewExamYear] = useState('2026-2027');
  const [newExamStart, setNewExamStart] = useState('2026-11-01');
  const [newExamEnd, setNewExamEnd] = useState('2026-11-15');

  // Add/Edit Mark Modal
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [markFormStudentId, setMarkFormStudentId] = useState('');
  const [markFormSubject, setMarkFormSubject] = useState('Mathematics');
  const [markFormMaxMarks, setMarkFormMaxMarks] = useState(100);
  const [markFormObtained, setMarkFormObtained] = useState(85);
  const [markFormRemarks, setMarkFormRemarks] = useState('Good conceptual clarity');

  // Report card viewer
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<Student | null>(null);

  const subjectsList = ['Mathematics', 'Science', 'English', 'Social Science', 'Computer Science', 'General Science'];

  const studentMap = useMemo(() => {
    const map: Record<string, Student> = {};
    students.forEach(s => {
      map[s.id] = s;
    });
    return map;
  }, [students]);

  // Compute Grade Helper
  const calculateGrade = (obtained: number, max: number): ExamSubjectMark['grade'] => {
    if (max <= 0) return 'Fail';
    const pct = (obtained / max) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 40) return 'D';
    return 'Fail';
  };

  // Filtered marks list
  const filteredMarks = useMemo(() => {
    return marks.filter(m => {
      const matchExam = m.examId === selectedExamId;
      const matchClass = selectedClass === 'All' || m.classNum === selectedClass;
      const matchSection = selectedSection === 'All' || m.section === selectedSection;
      const matchSubject = selectedSubject === 'All' || m.subject === selectedSubject;
      return matchExam && matchClass && matchSection && matchSubject;
    });
  }, [marks, selectedExamId, selectedClass, selectedSection, selectedSubject]);

  // Handle open add mark modal
  const handleOpenAddMark = (studentId?: string) => {
    const classEnrolled = students.filter(s => s.classNum === selectedClass && s.section === selectedSection);
    const targetStudent = studentId || (classEnrolled[0]?.id ?? students[0]?.id);

    setMarkFormStudentId(targetStudent);
    setMarkFormSubject(selectedSubject === 'All' ? 'Mathematics' : selectedSubject);
    setMarkFormMaxMarks(100);
    setMarkFormObtained(85);
    setMarkFormRemarks('Good conceptual grasp');
    setIsMarkModalOpen(true);
  };

  const handleSaveMarkRecord = (e: React.FormEvent) => {
    e.preventDefault();

    if (markFormObtained > markFormMaxMarks) {
      showToast('error', 'Invalid Marks', 'Obtained marks cannot exceed Maximum marks!');
      return;
    }

    if (markFormObtained < 0) {
      showToast('error', 'Invalid Marks', 'Marks cannot be negative.');
      return;
    }

    const student = studentMap[markFormStudentId];
    if (!student) {
      showToast('error', 'Student Missing', 'Selected student does not exist.');
      return;
    }

    const grade = calculateGrade(markFormObtained, markFormMaxMarks);

    // Check if mark record already exists for this exam, student, and subject
    const existingIndex = marks.findIndex(
      m => m.examId === selectedExamId && m.studentId === student.id && m.subject === markFormSubject
    );

    const markPayload: ExamSubjectMark = {
      id: existingIndex >= 0 ? marks[existingIndex].id : `MRK-${selectedExamId}-${student.id}-${Date.now().toString(36)}`,
      examId: selectedExamId,
      studentId: student.id,
      classNum: student.classNum,
      section: student.section,
      subject: markFormSubject,
      maxMarks: markFormMaxMarks,
      obtainedMarks: markFormObtained,
      grade,
      remarks: markFormRemarks,
    };

    let updatedList: ExamSubjectMark[];
    if (existingIndex >= 0) {
      updatedList = [...marks];
      updatedList[existingIndex] = markPayload;
    } else {
      updatedList = [markPayload, ...marks];
    }

    onSaveMarks(updatedList);
    showToast('success', 'Marks Recorded', `Saved ${markFormSubject} score (${markFormObtained}/${markFormMaxMarks}) for ${student.fullName}.`);
    setIsMarkModalOpen(false);
  };

  // Add Exam
  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamName.trim()) {
      showToast('error', 'Name Required', 'Please enter an examination title.');
      return;
    }

    const newExam: Examination = {
      id: `EXAM-${Date.now()}`,
      name: newExamName.trim(),
      academicYear: newExamYear,
      startDate: newExamStart,
      endDate: newExamEnd,
    };

    onAddExamination(newExam);
    setSelectedExamId(newExam.id);
    showToast('success', 'Examination Created', `Added "${newExam.name}" to academic calendar.`);
    setIsExamModalOpen(false);
    setNewExamName('');
  };

  const handlePrintReportCard = () => {
    window.print();
  };

  const handleDownloadPDFReportCard = (student: Student) => {
    const studentMarks = marks.filter(m => m.studentId === student.id && m.examId === selectedExamId);
    const exam = examinations.find(e => e.id === selectedExamId);
    generateStudentReportCardPDF(student, studentMarks, exam?.name || 'Academic Assessment', schoolProfile);
    showToast('info', 'Report Card Exported', `Generated PDF report card for ${student.fullName}.`);
  };

  // Students in current class for Report Card tab
  const classStudents = useMemo(() => {
    return students.filter(s => s.classNum === selectedClass && s.section === selectedSection);
  }, [students, selectedClass, selectedSection]);

  const activeExam = examinations.find(e => e.id === selectedExamId) || examinations[0];

  return (
    <div className="space-y-6">
      {/* Title & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Grades & Examination Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Publish assessment marks, calculate letter grades, and generate student report cards
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveTab('marks')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'marks'
                  ? 'bg-amber-500 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Enter / View Marks
            </button>
            <button
              onClick={() => setActiveTab('reportcard')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'reportcard'
                  ? 'bg-amber-500 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Report Cards
            </button>
            <button
              onClick={() => setActiveTab('exams')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'exams'
                  ? 'bg-amber-500 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Examinations
            </button>
          </div>

          <button
            onClick={() => handleOpenAddMark()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Marks</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: ENTER & VIEW MARKS ================= */}
      {activeTab === 'marks' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Exam:</span>
                <select
                  value={selectedExamId}
                  onChange={e => setSelectedExamId(e.target.value)}
                  className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden"
                >
                  {examinations.map(ex => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Class:</span>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
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
                <span className="text-slate-500">Section:</span>
                <select
                  value={selectedSection}
                  onChange={e => setSelectedSection(e.target.value as any)}
                  className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden"
                >
                  <option value="All">All Sections</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Subject:</span>
                <select
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden"
                >
                  <option value="All">All Subjects</option>
                  {subjectsList.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <span className="text-slate-400 font-mono">{filteredMarks.length} Records found</span>
          </div>

          {/* Marks Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Class-Sec</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Max Marks</th>
                    <th className="py-3 px-4">Obtained</th>
                    <th className="py-3 px-4">Percentage</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4">Remarks</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                  {filteredMarks.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        No marks records found for this combination. Click "Add Marks" to log assessment scores.
                      </td>
                    </tr>
                  ) : (
                    filteredMarks.map(m => {
                      const stu = studentMap[m.studentId];
                      const pct = Math.round((m.obtainedMarks / m.maxMarks) * 100);

                      let gradeBadgeColor = 'text-amber-600 bg-amber-50 dark:bg-amber-950/40';
                      if (m.grade === 'A+' || m.grade === 'A') {
                        gradeBadgeColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40';
                      } else if (m.grade === 'Fail') {
                        gradeBadgeColor = 'text-rose-600 bg-rose-50 dark:bg-rose-950/40';
                      }

                      return (
                        <tr
                          key={m.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono font-medium text-amber-600 dark:text-amber-400">
                            {m.studentId}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                            {stu ? stu.fullName : m.studentId}
                          </td>
                          <td className="py-3 px-4 font-mono">
                            Class {m.classNum}-{m.section}
                          </td>
                          <td className="py-3 px-4 font-medium">{m.subject}</td>
                          <td className="py-3 px-4 font-mono tabular-nums text-slate-500">{m.maxMarks}</td>
                          <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                            {m.obtainedMarks}
                          </td>
                          <td className="py-3 px-4 font-mono tabular-nums font-semibold">{pct}%</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${gradeBadgeColor}`}>
                              {m.grade}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 truncate max-w-xs">{m.remarks || '-'}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setMarkFormStudentId(m.studentId);
                                setMarkFormSubject(m.subject);
                                setMarkFormMaxMarks(m.maxMarks);
                                setMarkFormObtained(m.obtainedMarks);
                                setMarkFormRemarks(m.remarks || '');
                                setIsMarkModalOpen(true);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-blue-600"
                              title="Edit Mark"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
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

      {/* ================= TAB 2: STUDENT REPORT CARDS ================= */}
      {activeTab === 'reportcard' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Select Student to View Report Card:</span>
              <select
                value={selectedStudentForReport?.id || ''}
                onChange={e => {
                  const s = students.find(item => item.id === e.target.value);
                  setSelectedStudentForReport(s || null);
                }}
                className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="">-- Choose Student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.id} · Class {s.classNum}-{s.section})
                  </option>
                ))}
              </select>
            </div>

            {selectedStudentForReport && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintReportCard}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 font-medium"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => handleDownloadPDFReportCard(selectedStudentForReport)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* Interactive Report Card View */}
          {selectedStudentForReport ? (
            <div className="print-container max-w-3xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-xl text-slate-800 dark:text-slate-100">
              {/* Institution Header */}
              <div className="text-center pb-6 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs uppercase tracking-widest font-bold text-amber-600">
                  Official Academic Report
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                  {schoolProfile.name}
                </h2>
                <p className="text-xs text-slate-500 italic mt-0.5">{schoolProfile.motto}</p>
                <p className="text-[11px] text-slate-400 mt-1">{schoolProfile.address} · Tel: {schoolProfile.phone}</p>
                <div className="inline-block mt-3 px-4 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 font-semibold text-xs border border-amber-200 dark:border-amber-800">
                  {activeExam.name} · Session {schoolProfile.academicYear}
                </div>
              </div>

              {/* Student Metadata Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Student Name</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedStudentForReport.fullName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Student ID</span>
                  <p className="font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">{selectedStudentForReport.id}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Class & Section</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    Class {selectedStudentForReport.classNum}-{selectedStudentForReport.section}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Parent / Guardian</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedStudentForReport.parentName}</p>
                </div>
              </div>

              {/* Marks Table */}
              <div className="py-6">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-2.5">Subject</th>
                      <th className="py-2.5 text-center">Max Marks</th>
                      <th className="py-2.5 text-center">Obtained Marks</th>
                      <th className="py-2.5 text-center">Percentage</th>
                      <th className="py-2.5 text-center">Grade</th>
                      <th className="py-2.5">Teacher Evaluation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {marks
                      .filter(m => m.studentId === selectedStudentForReport.id && m.examId === selectedExamId)
                      .map(m => {
                        const pct = Math.round((m.obtainedMarks / m.maxMarks) * 100);
                        return (
                          <tr key={m.id}>
                            <td className="py-3 font-semibold text-slate-900 dark:text-white">{m.subject}</td>
                            <td className="py-3 text-center font-mono tabular-nums text-slate-400">{m.maxMarks}</td>
                            <td className="py-3 text-center font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                              {m.obtainedMarks}
                            </td>
                            <td className="py-3 text-center font-mono tabular-nums">{pct}%</td>
                            <td className="py-3 text-center">
                              <span className="font-bold text-amber-600 dark:text-amber-400">{m.grade}</span>
                            </td>
                            <td className="py-3 text-slate-500 italic">{m.remarks || 'Commendable'}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                  <div className="h-10 border-b border-slate-300 dark:border-slate-700 mb-1" />
                  <p className="font-medium text-slate-600 dark:text-slate-400">Class Teacher</p>
                </div>
                <div>
                  <div className="h-10 border-b border-slate-300 dark:border-slate-700 mb-1" />
                  <p className="font-medium text-slate-600 dark:text-slate-400">Guardian / Parent</p>
                </div>
                <div>
                  <div className="h-10 border-b border-slate-300 dark:border-slate-700 mb-1" />
                  <p className="font-medium text-slate-900 dark:text-white">{schoolProfile.principalName}</p>
                  <p className="text-[10px] text-slate-400">Head of Institution</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-400 text-xs">
              Please choose a student from the dropdown above to display their comprehensive report card.
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: EXAMINATIONS LIST ================= */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Configured Academic Examinations</span>
            <button
              onClick={() => setIsExamModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Examination</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {examinations.map(ex => (
              <div
                key={ex.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                      {ex.id}
                    </span>
                    <span className="text-xs text-slate-400">{ex.academicYear}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5">{ex.name}</h3>
                  <p className="text-xs text-slate-500 mt-2">
                    Window: {ex.startDate} to {ex.endDate}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Active Assessment</span>
                  <button
                    onClick={() => {
                      setSelectedExamId(ex.id);
                      setActiveTab('marks');
                    }}
                    className="text-xs font-medium text-amber-600 hover:text-amber-700"
                  >
                    View Marks &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE EXAM MODAL */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">New Examination</h2>
              <button
                onClick={() => setIsExamModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="p-6 space-y-4">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Examination Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newExamName}
                  onChange={e => setNewExamName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                  placeholder="e.g. Second Term Assessment 2026"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={newExamYear}
                  onChange={e => setNewExamYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newExamStart}
                    onChange={e => setNewExamStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newExamEnd}
                    onChange={e => setNewExamEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl shadow-xs"
                >
                  Create Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT MARKS MODAL */}
      {isMarkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Record Assessment Marks</h2>
              <button
                onClick={() => setIsMarkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMarkRecord} className="p-6 space-y-4">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Student <span className="text-rose-500">*</span>
                </label>
                <select
                  value={markFormStudentId}
                  onChange={e => setMarkFormStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.id} - Class {s.classNum}-{s.section})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subject Discipline <span className="text-rose-500">*</span>
                </label>
                <select
                  value={markFormSubject}
                  onChange={e => setMarkFormSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                >
                  {subjectsList.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Maximum Marks <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={markFormMaxMarks}
                    onChange={e => setMarkFormMaxMarks(parseInt(e.target.value, 10) || 100)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Obtained Marks <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={markFormMaxMarks}
                    value={markFormObtained}
                    onChange={e => setMarkFormObtained(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Dynamic Live Grade Indicator */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">Computed Grade:</span>
                <span className="font-bold font-mono text-amber-600 text-sm">
                  {calculateGrade(markFormObtained, markFormMaxMarks)} (
                  {markFormMaxMarks > 0 ? Math.round((markFormObtained / markFormMaxMarks) * 100) : 0}%)
                </span>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Teacher Remarks / Comments
                </label>
                <input
                  type="text"
                  value={markFormRemarks}
                  onChange={e => setMarkFormRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                  placeholder="e.g. Excellent analytical reasoning"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMarkModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl shadow-xs"
                >
                  Save Marks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

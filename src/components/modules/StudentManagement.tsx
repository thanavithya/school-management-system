import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Download,
  Upload,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { Student } from '../../types';
import { exportToCSV, generateStudentListPDF } from '../../services/pdfExport';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../common/ConfirmModal';

interface StudentManagementProps {
  students: Student[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  selectedStudentFromSearch?: Student | null;
  schoolProfile: any;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  selectedStudentFromSearch,
  schoolProfile,
}) => {
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(selectedStudentFromSearch || null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState<Partial<Student>>({
    id: '',
    fullName: '',
    dob: '2015-01-01',
    gender: 'Male',
    classNum: '5',
    section: 'A',
    parentName: '',
    parentPhone: '',
    email: '',
    address: '',
    admissionDate: new Date().toISOString().split('T')[0],
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filtered List
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch =
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.parentName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchClass = classFilter === 'All' || s.classNum === classFilter;
      const matchSection = sectionFilter === 'All' || s.section === sectionFilter;
      const matchGender = genderFilter === 'All' || s.gender === genderFilter;
      return matchSearch && matchClass && matchSection && matchGender;
    });
  }, [students, searchQuery, classFilter, sectionFilter, genderFilter]);

  const handleOpenAdd = () => {
    // Generate next available ID
    const maxNum = students.reduce((acc, s) => {
      const match = s.id.match(/\d+/);
      const val = match ? parseInt(match[0], 10) : 0;
      return val > acc ? val : acc;
    }, 1000);

    setEditingStudent(null);
    setFormData({
      id: `STU-${maxNum + 1}`,
      fullName: '',
      dob: '2015-05-15',
      gender: 'Male',
      classNum: '5',
      section: 'A',
      parentName: '',
      parentPhone: '',
      email: '',
      address: '',
      admissionDate: new Date().toISOString().split('T')[0],
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({ ...student });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('error', 'File Too Large', 'Please upload a photo under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = event => {
        setFormData(prev => ({ ...prev, photoUrl: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.id?.trim()) errors.id = 'Student ID is required.';
    else if (!editingStudent && students.some(s => s.id.toLowerCase() === formData.id?.trim().toLowerCase())) {
      errors.id = 'This Student ID already exists in the database.';
    }
    if (!formData.fullName?.trim()) errors.fullName = 'Full name is required.';
    if (!formData.dob) errors.dob = 'Date of birth is required.';
    if (!formData.parentName?.trim()) errors.parentName = 'Parent/Guardian name is required.';
    if (!formData.parentPhone?.trim()) errors.parentPhone = 'Parent phone is required.';
    if (!formData.address?.trim()) errors.address = 'Residential address is required.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('error', 'Validation Error', 'Please check highlighted fields.');
      return;
    }

    const payload = formData as Student;
    if (editingStudent) {
      onUpdateStudent(payload);
      showToast('success', 'Student Updated', `${payload.fullName}'s profile was updated.`);
    } else {
      onAddStudent(payload);
      showToast('success', 'Student Enrolled', `${payload.fullName} registered under ID ${payload.id}.`);
    }
    setIsFormModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Full Name', 'Class', 'Section', 'Gender', 'Parent Name', 'Parent Phone', 'Admission Date', 'Address'];
    const rows = filteredStudents.map(s => [
      s.id,
      s.fullName,
      s.classNum,
      s.section,
      s.gender,
      s.parentName,
      s.parentPhone,
      s.admissionDate,
      s.address,
    ]);
    exportToCSV('Student_Directory_Export', headers, rows);
    showToast('info', 'Export Successful', 'Student directory downloaded as CSV.');
  };

  const handleExportPDF = () => {
    generateStudentListPDF(filteredStudents, schoolProfile, classFilter);
    showToast('info', 'PDF Generated', 'Student directory downloaded as PDF.');
  };

  return (
    <div className="space-y-6">
      {/* Module Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Student Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Total {students.length} students enrolled across Classes 1–10
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
            title="Generate PDF Report"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-500" />
            <span>PDF</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, ID, or parent..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Class:</span>
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
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

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500">Section:</span>
            <select
              value={sectionFilter}
              onChange={e => setSectionFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="All">All</option>
              <option value="A">Sec A</option>
              <option value="B">Sec B</option>
              <option value="C">Sec C</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500">Gender:</span>
            <select
              value={genderFilter}
              onChange={e => setGenderFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Class-Sec</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4">Parent Details</th>
                <th className="py-3 px-4">Admission</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No students match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.photoUrl}
                          alt={student.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{student.fullName}</p>
                          <p className="text-[11px] text-slate-400">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-amber-600 dark:text-amber-400">
                      {student.id}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium font-mono text-[11px]">
                        Class {student.classNum}-{student.section}
                      </span>
                    </td>
                    <td className="py-3 px-4">{student.gender}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{student.parentName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{student.parentPhone}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{student.admissionDate}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingStudent(student)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setStudentToDelete(student)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* STUDENT PROFILE VIEW MODAL */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
            <div className="relative bg-linear-to-r from-amber-500 to-amber-600 p-6 text-white">
              <button
                onClick={() => setViewingStudent(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4">
                <img
                  src={viewingStudent.photoUrl}
                  alt={viewingStudent.fullName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white/80 shadow-md"
                />
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-100">
                    Student Profile Card
                  </span>
                  <h2 className="text-xl font-bold">{viewingStudent.fullName}</h2>
                  <p className="text-amber-100 font-mono mt-0.5">
                    {viewingStudent.id} · Class {viewingStudent.classNum}-{viewingStudent.section}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 text-slate-700 dark:text-slate-300">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Date of Birth</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{viewingStudent.dob}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Gender</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{viewingStudent.gender}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Admission Date</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{viewingStudent.admissionDate}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Student Email</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5 truncate">{viewingStudent.email}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Parent / Guardian Information</span>
                <div className="mt-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-900 dark:text-white">{viewingStudent.parentName}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{viewingStudent.parentPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{viewingStudent.address}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setViewingStudent(null);
                    handleOpenEdit(viewingStudent);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setViewingStudent(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT STUDENT MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingStudent ? 'Edit Student Details' : 'Enroll New Student'}
              </h2>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-4">
              {/* Photo Preview & Upload */}
              <div className="flex items-center gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <img
                  src={formData.photoUrl}
                  alt="Student Preview"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700"
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student Photograph
                  </label>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer text-xs font-medium">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload New Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1">PNG, JPG or WebP up to 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Student ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.id || ''}
                    disabled={!!editingStudent}
                    onChange={e => setFormData({ ...formData, id: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border ${
                      formErrors.id ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    } text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500/20`}
                    placeholder="e.g. STU-1025"
                  />
                  {formErrors.id && <p className="text-[10px] text-rose-500 mt-1">{formErrors.id}</p>}
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName || ''}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border ${
                      formErrors.fullName ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    } text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20`}
                    placeholder="e.g. Liam Alexander Hayes"
                  />
                  {formErrors.fullName && <p className="text-[10px] text-rose-500 mt-1">{formErrors.fullName}</p>}
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date of Birth <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dob || ''}
                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                  <select
                    value={formData.gender || 'Male'}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Class <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.classNum || '5'}
                    onChange={e => setFormData({ ...formData, classNum: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                      <option key={c} value={String(c)}>
                        Class {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Section <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.section || 'A'}
                    onChange={e => setFormData({ ...formData, section: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Parent / Guardian Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.parentName || ''}
                    onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border ${
                      formErrors.parentName ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    } text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20`}
                    placeholder="e.g. Christopher Hayes"
                  />
                  {formErrors.parentName && <p className="text-[10px] text-rose-500 mt-1">{formErrors.parentName}</p>}
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Parent Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.parentPhone || ''}
                    onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border ${
                      formErrors.parentPhone ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    } text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500/20`}
                    placeholder="+1 (555) 301-4401"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Student/Parent Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                    placeholder="student@schoolpro.edu"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Admission Date</label>
                  <input
                    type="date"
                    value={formData.admissionDate || ''}
                    onChange={e => setFormData({ ...formData, admissionDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Residential Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border ${
                    formErrors.address ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  } text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20`}
                  placeholder="Street address, apartment, city, ZIP"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl shadow-xs transition-colors"
                >
                  {editingStudent ? 'Save Changes' : 'Complete Admission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!studentToDelete}
        title="Confirm Student Deletion"
        message={`Are you certain you want to remove student "${studentToDelete?.fullName}" (${studentToDelete?.id}) from the enrollment database? This action will permanently remove their records.`}
        confirmText="Delete Record"
        onConfirm={() => {
          if (studentToDelete) {
            onDeleteStudent(studentToDelete.id);
            showToast('info', 'Student Removed', `${studentToDelete.fullName} has been deleted.`);
            setStudentToDelete(null);
          }
        }}
        onCancel={() => setStudentToDelete(null)}
      />
    </div>
  );
};

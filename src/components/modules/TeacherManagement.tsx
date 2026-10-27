import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Calendar,
  X,
  BookOpen,
  Award,
} from 'lucide-react';
import { Teacher } from '../../types';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../common/ConfirmModal';

interface TeacherManagementProps {
  teachers: Teacher[];
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
}

export const TeacherManagement: React.FC<TeacherManagementProps> = ({
  teachers,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
}) => {
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState<Partial<Teacher>>({
    id: '',
    name: '',
    email: '',
    phone: '',
    qualification: '',
    subjects: ['Mathematics'],
    assignedClasses: ['5-A'],
    joiningDate: new Date().toISOString().split('T')[0],
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  });
  const [subjectsInput, setSubjectsInput] = useState('');
  const [classesInput, setClassesInput] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // All distinct subjects for filter
  const allDistinctSubjects = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach(t => t.subjects.forEach(s => set.add(s)));
    return Array.from(set);
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const matchSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSubject = subjectFilter === 'All' || t.subjects.includes(subjectFilter);
      return matchSearch && matchSubject;
    });
  }, [teachers, searchQuery, subjectFilter]);

  const handleOpenAdd = () => {
    const maxNum = teachers.reduce((acc, t) => {
      const match = t.id.match(/\d+/);
      const val = match ? parseInt(match[0], 10) : 0;
      return val > acc ? val : acc;
    }, 100);

    setEditingTeacher(null);
    setFormData({
      id: `TCH-${maxNum + 1}`,
      name: '',
      email: '',
      phone: '+1 (555) 101-20',
      qualification: 'M.Sc. / B.Ed.',
      subjects: ['Mathematics'],
      assignedClasses: ['5-A'],
      joiningDate: new Date().toISOString().split('T')[0],
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    });
    setSubjectsInput('Mathematics, Science');
    setClassesInput('5-A, 6-A');
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({ ...teacher });
    setSubjectsInput(teacher.subjects.join(', '));
    setClassesInput(teacher.assignedClasses.join(', '));
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.id?.trim()) errors.id = 'Teacher ID is required.';
    else if (!editingTeacher && teachers.some(t => t.id.toLowerCase() === formData.id?.trim().toLowerCase())) {
      errors.id = 'This Teacher ID is already assigned.';
    }
    if (!formData.name?.trim()) errors.name = 'Full name is required.';
    if (!formData.email?.trim()) errors.email = 'Valid institutional email is required.';
    if (!formData.phone?.trim()) errors.phone = 'Contact phone is required.';
    if (!formData.qualification?.trim()) errors.qualification = 'Academic qualification is required.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('error', 'Validation Error', 'Please check required fields.');
      return;
    }

    const parsedSubjects = subjectsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const parsedClasses = classesInput
      .split(',')
      .map(c => c.trim().replace(/^Class\s*/i, ''))
      .filter(Boolean);

    const payload: Teacher = {
      ...(formData as Teacher),
      subjects: parsedSubjects.length > 0 ? parsedSubjects : ['General'],
      assignedClasses: parsedClasses.length > 0 ? parsedClasses : ['5-A'],
    };

    if (editingTeacher) {
      onUpdateTeacher(payload);
      showToast('success', 'Faculty Updated', `${payload.name}'s profile was updated.`);
    } else {
      onAddTeacher(payload);
      showToast('success', 'Faculty Appointed', `${payload.name} appointed as instructor.`);
    }
    setIsFormModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Faculty & Teacher Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Total {teachers.length} active instructors and subject specialists
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search faculty by name, ID, or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500">Subject:</span>
            <select
              value={subjectFilter}
              onChange={e => setSubjectFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Disciplines</option>
              {allDistinctSubjects.map(sub => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Teacher Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map(teacher => (
          <div
            key={teacher.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-amber-400/50 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={teacher.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                    alt={teacher.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">
                      {teacher.name}
                    </h3>
                    <p className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-medium">
                      {teacher.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingTeacher(teacher)}
                    className="p-1 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="View Profile"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(teacher)}
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Profile"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setTeacherToDelete(teacher)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Delete Teacher"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{teacher.qualification}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate font-medium">{teacher.subjects.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{teacher.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono">{teacher.phone}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Assigned: {teacher.assignedClasses.join(', ')}</span>
              <span className="text-slate-400">Joined {teacher.joiningDate}</span>
            </div>
          </div>
        ))}
      </div>

      {/* TEACHER PROFILE MODAL */}
      {viewingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
            <div className="bg-linear-to-r from-amber-500 to-amber-600 p-6 text-white relative">
              <button
                onClick={() => setViewingTeacher(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <img
                  src={viewingTeacher.avatarUrl}
                  alt={viewingTeacher.name}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-white/80 shadow-md"
                />
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-100">Faculty Dossier</span>
                  <h3 className="text-lg font-bold">{viewingTeacher.name}</h3>
                  <p className="font-mono text-amber-100">{viewingTeacher.id}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Qualifications</span>
                <p className="font-medium text-slate-800 dark:text-slate-100 mt-0.5">{viewingTeacher.qualification}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Teaching Subjects</span>
                <p className="font-medium text-slate-800 dark:text-slate-100 mt-0.5">{viewingTeacher.subjects.join(', ')}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Assigned Classes</span>
                <p className="font-medium text-slate-800 dark:text-slate-100 mt-0.5">{viewingTeacher.assignedClasses.join(', ')}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Phone</span>
                  <p className="font-mono font-medium text-slate-800 dark:text-slate-100 mt-0.5">{viewingTeacher.phone}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Joining Date</span>
                  <p className="font-mono font-medium text-slate-800 dark:text-slate-100 mt-0.5">{viewingTeacher.joiningDate}</p>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setViewingTeacher(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT TEACHER MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingTeacher ? 'Edit Faculty Details' : 'Appoint New Teacher'}
              </h2>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Faculty ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={!!editingTeacher}
                    value={formData.id || ''}
                    onChange={e => setFormData({ ...formData, id: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border ${
                      formErrors.id ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    } text-slate-900 dark:text-white font-mono focus:outline-hidden`}
                    placeholder="e.g. TCH-107"
                  />
                  {formErrors.id && <p className="text-[10px] text-rose-500 mt-1">{formErrors.id}</p>}
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border ${
                      formErrors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    } text-slate-900 dark:text-white focus:outline-hidden`}
                    placeholder="e.g. Dr. Robert Vance"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Institutional Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                    placeholder="teacher@schoolpro.edu"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-hidden"
                    placeholder="+1 (555) 101-2005"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Academic Qualification <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.qualification || ''}
                  onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                  placeholder="e.g. M.Sc. Physics, M.Ed."
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Teaching Subjects (comma-separated)
                </label>
                <input
                  type="text"
                  value={subjectsInput}
                  onChange={e => setSubjectsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                  placeholder="e.g. Mathematics, Statistics, Physics"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Classes (comma-separated)
                </label>
                <input
                  type="text"
                  value={classesInput}
                  onChange={e => setClassesInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                  placeholder="e.g. 5-A, 6-B, 10-A"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl shadow-xs"
                >
                  {editingTeacher ? 'Save Changes' : 'Appoint Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!teacherToDelete}
        title="Confirm Faculty Removal"
        message={`Are you sure you want to remove teacher "${teacherToDelete?.name}" (${teacherToDelete?.id})? This will unassign them from their classes.`}
        confirmText="Remove Teacher"
        onConfirm={() => {
          if (teacherToDelete) {
            onDeleteTeacher(teacherToDelete.id);
            showToast('info', 'Faculty Removed', `${teacherToDelete.name} has been removed.`);
            setTeacherToDelete(null);
          }
        }}
        onCancel={() => setTeacherToDelete(null)}
      />
    </div>
  );
};

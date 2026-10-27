import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Users,
  UserCheck,
  DoorOpen,
  AlertTriangle,
  X,
  Search,
} from 'lucide-react';
import { ClassSection, Teacher, Student } from '../../types';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../common/ConfirmModal';

interface ClassManagementProps {
  classes: ClassSection[];
  teachers: Teacher[];
  students: Student[];
  onAddClass: (cls: ClassSection) => void;
  onUpdateClass: (cls: ClassSection) => void;
  onDeleteClass: (id: string) => void;
}

export const ClassManagement: React.FC<ClassManagementProps> = ({
  classes,
  teachers,
  students,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
}) => {
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassNum, setSelectedClassNum] = useState('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSection | null>(null);
  const [classToDelete, setClassToDelete] = useState<ClassSection | null>(null);
  const [blockingDeleteWarning, setBlockingDeleteWarning] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ClassSection>>({
    classNum: '1',
    section: 'A',
    classTeacherId: teachers[0]?.id || '',
    roomNumber: 'Room 101',
  });

  // Calculate enrolled students per class-section
  const studentCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    students.forEach(s => {
      const key = `${s.classNum}-${s.section}`;
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [students]);

  // Filtered classes
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      const key = `${cls.classNum}-${cls.section}`;
      const teacher = teachers.find(t => t.id === cls.classTeacherId);
      const matchSearch =
        key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (teacher && teacher.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchClass = selectedClassNum === 'All' || cls.classNum === selectedClassNum;
      return matchSearch && matchClass;
    });
  }, [classes, searchQuery, selectedClassNum, teachers]);

  const handleOpenAdd = () => {
    setEditingClass(null);
    setFormData({
      classNum: '5',
      section: 'A',
      classTeacherId: teachers[0]?.id || '',
      roomNumber: 'Room 301',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassSection) => {
    setEditingClass(cls);
    setFormData({ ...cls });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (cls: ClassSection) => {
    const key = `${cls.classNum}-${cls.section}`;
    const enrolled = studentCountMap[key] || 0;
    if (enrolled > 0) {
      setBlockingDeleteWarning(
        `Cannot delete Class ${cls.classNum}-${cls.section}: There are currently ${enrolled} student(s) enrolled in this section. Please reassign or transfer all students before deleting this class.`
      );
      return;
    }
    setClassToDelete(cls);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `CLS-${formData.classNum}-${formData.section}`;

    // Duplicate check if new
    if (!editingClass && classes.some(c => c.id === id)) {
      showToast('error', 'Duplicate Class Section', `Class ${formData.classNum}-${formData.section} already exists.`);
      return;
    }

    const payload: ClassSection = {
      id: editingClass ? editingClass.id : id,
      classNum: formData.classNum || '1',
      section: (formData.section as any) || 'A',
      classTeacherId: formData.classTeacherId || teachers[0]?.id || '',
      roomNumber: formData.roomNumber || 'Room 101',
    };

    if (editingClass) {
      onUpdateClass(payload);
      showToast('success', 'Class Updated', `Class ${payload.classNum}-${payload.section} details updated.`);
    } else {
      onAddClass(payload);
      showToast('success', 'Class Created', `Class ${payload.classNum}-${payload.section} added to school registry.`);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Class & Section Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Standard Class 1 through 10 with sections A, B, and C
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Class Section</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search class, section, teacher or room..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Filter Class:</span>
          <select
            value={selectedClassNum}
            onChange={e => setSelectedClassNum(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="All">All Grades (1-10)</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
              <option key={c} value={String(c)}>
                Class {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredClasses.map(cls => {
          const teacher = teachers.find(t => t.id === cls.classTeacherId);
          const studentCount = studentCountMap[`${cls.classNum}-${cls.section}`] || 0;

          return (
            <div
              key={cls.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-amber-400/50 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                      {cls.classNum}{cls.section}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        Class {cls.classNum} - Section {cls.section}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">{cls.roomNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cls)}
                      className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Class"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(cls)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Delete Class"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      Teacher: <strong className="font-medium text-slate-900 dark:text-white">{teacher?.name || 'Unassigned'}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Enrolled Students:{' '}
                      <strong className="font-mono text-amber-600 dark:text-amber-400">
                        {studentCount}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Room: {cls.roomNumber}</span>
                <span className={`px-2 py-0.5 rounded-md ${studentCount > 0 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' : 'text-slate-400 bg-slate-100 dark:bg-slate-800'}`}>
                  {studentCount > 0 ? `${studentCount} Active` : 'Empty'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* BLOCKING DELETE WARNING MODAL */}
      {blockingDeleteWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-900/60 p-6 text-slate-800 dark:text-slate-100">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Deletion Protected</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {blockingDeleteWarning}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setBlockingDeleteWarning(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL (When 0 students) */}
      <ConfirmModal
        isOpen={!!classToDelete}
        title="Confirm Class Section Deletion"
        message={`Are you sure you want to delete Class ${classToDelete?.classNum}-${classToDelete?.section}? There are no enrolled students in this section.`}
        confirmText="Delete Section"
        onConfirm={() => {
          if (classToDelete) {
            onDeleteClass(classToDelete.id);
            showToast('info', 'Class Section Deleted', `Class ${classToDelete.classNum}-${classToDelete.section} removed.`);
            setClassToDelete(null);
          }
        }}
        onCancel={() => setClassToDelete(null)}
      />

      {/* ADD / EDIT CLASS SECTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingClass ? 'Edit Class Section' : 'Create Class Section'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Class Grade (1 to 10)
                </label>
                <select
                  disabled={!!editingClass}
                  value={formData.classNum}
                  onChange={e => setFormData({ ...formData, classNum: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
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
                  Section (A, B, or C)
                </label>
                <select
                  disabled={!!editingClass}
                  value={formData.section}
                  onChange={e => setFormData({ ...formData, section: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Class Teacher
                </label>
                <select
                  value={formData.classTeacherId}
                  onChange={e => setFormData({ ...formData, classTeacherId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Classroom / Hall Number
                </label>
                <input
                  type="text"
                  value={formData.roomNumber || ''}
                  onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                  placeholder="e.g. Room 301, Science Wing"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl shadow-xs"
                >
                  {editingClass ? 'Save Changes' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

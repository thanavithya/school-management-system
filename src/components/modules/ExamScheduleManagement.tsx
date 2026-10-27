import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Plus,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  AlertTriangle,
  X,
  Search,
  BookOpen,
} from 'lucide-react';
import { ExamScheduleItem, Examination, SchoolProfile } from '../../types';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../common/ConfirmModal';

interface ExamScheduleManagementProps {
  examSchedules: ExamScheduleItem[];
  examinations: Examination[];
  schoolProfile: SchoolProfile;
  onSaveSchedule: (item: ExamScheduleItem) => void;
  onDeleteSchedule: (id: string) => void;
}

export const ExamScheduleManagement: React.FC<ExamScheduleManagementProps> = ({
  examSchedules,
  examinations,
  schoolProfile,
  onSaveSchedule,
  onDeleteSchedule,
}) => {
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExamScheduleItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ExamScheduleItem | null>(null);

  // Form State
  const [formExamId, setFormExamId] = useState(examinations[0]?.id || '');
  const [formClassNum, setFormClassNum] = useState('5');
  const [formSubject, setFormSubject] = useState('Mathematics');
  const [formDate, setFormDate] = useState('2026-11-05');
  const [formStart, setFormStart] = useState('09:00');
  const [formEnd, setFormEnd] = useState('11:00');
  const [formRoom, setFormRoom] = useState('Hall A (Room 301)');

  const subjectsList = ['Mathematics', 'Science', 'English', 'Social Science', 'Computer Science', 'Physics', 'Chemistry'];

  const filteredSchedules = useMemo(() => {
    return examSchedules.filter(sch => {
      const matchSearch =
        sch.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sch.examName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sch.room.toLowerCase().includes(searchQuery.toLowerCase());
      const matchClass = selectedClass === 'All' || sch.classNum === selectedClass;
      return matchSearch && matchClass;
    });
  }, [examSchedules, searchQuery, selectedClass]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormExamId(examinations[0]?.id || '');
    setFormClassNum('5');
    setFormSubject('Mathematics');
    setFormDate('2026-11-05');
    setFormStart('09:00');
    setFormEnd('11:00');
    setFormRoom('Hall A (Room 301)');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ExamScheduleItem) => {
    setEditingItem(item);
    setFormExamId(item.examId);
    setFormClassNum(item.classNum);
    setFormSubject(item.subject);
    setFormDate(item.examDate);
    setFormStart(item.startTime);
    setFormEnd(item.endTime);
    setFormRoom(item.room);
    setIsModalOpen(true);
  };

  // Conflict Checking
  const checkConflict = (
    classNum: string,
    examDate: string,
    startTime: string,
    endTime: string,
    room: string,
    currentId?: string
  ) => {
    // 1. Conflict for SAME class on the SAME date & overlapping times
    const classConflict = examSchedules.find(
      s =>
        s.id !== currentId &&
        s.classNum === classNum &&
        s.examDate === examDate &&
        ((startTime >= s.startTime && startTime < s.endTime) ||
          (endTime > s.startTime && endTime <= s.endTime) ||
          (startTime <= s.startTime && endTime >= s.endTime))
    );
    if (classConflict) {
      return {
        hasConflict: true,
        reason: `Exam Timing Conflict: Class ${classNum} is already taking "${classConflict.subject}" on ${examDate} between ${classConflict.startTime} and ${classConflict.endTime}.`,
      };
    }

    // 2. Conflict for SAME room at the SAME date & time
    const roomConflict = examSchedules.find(
      s =>
        s.id !== currentId &&
        s.room.toLowerCase() === room.toLowerCase() &&
        s.examDate === examDate &&
        ((startTime >= s.startTime && startTime < s.endTime) ||
          (endTime > s.startTime && endTime <= s.endTime))
    );
    if (roomConflict) {
      return {
        hasConflict: true,
        reason: `Room Collision: ${room} is already booked for Class ${roomConflict.classNum} (${roomConflict.subject}) on this date and time.`,
      };
    }

    return { hasConflict: false };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const conflict = checkConflict(formClassNum, formDate, formStart, formEnd, formRoom, editingItem?.id);
    if (conflict.hasConflict) {
      showToast('error', 'Exam Conflict Detected', conflict.reason);
      return;
    }

    const exam = examinations.find(ex => ex.id === formExamId);

    const payload: ExamScheduleItem = {
      id: editingItem ? editingItem.id : `SCH-${Date.now().toString(36)}`,
      examId: formExamId,
      examName: exam?.name || 'Academic Assessment',
      classNum: formClassNum,
      subject: formSubject,
      examDate: formDate,
      startTime: formStart,
      endTime: formEnd,
      room: formRoom,
    };

    onSaveSchedule(payload);
    showToast(
      'success',
      'Exam Scheduled',
      `Class ${payload.classNum} ${payload.subject} exam booked on ${payload.examDate} in ${payload.room}.`
    );
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Examination Schedule & Seating
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Publish assessment timetables, exam room allocations, and collision guards
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Paper</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search exam paper, subject, or room..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Filter Class:</span>
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
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

      {/* Exam Schedules Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSchedules.map(sch => (
          <div
            key={sch.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-amber-400/50 transition-colors text-xs"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 font-bold text-[11px]">
                  Class {sch.classNum}
                </span>
                <span className="font-mono text-slate-400 text-[11px]">{sch.examDate}</span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2 leading-snug">
                {sch.subject}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{sch.examName}</p>

              <div className="mt-3.5 space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">
                    {sch.startTime} - {sch.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sch.room}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-emerald-600 font-medium">Scheduled</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(sch)}
                  className="p-1 rounded text-slate-400 hover:text-blue-600"
                  title="Edit Schedule"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setItemToDelete(sch)}
                  className="p-1 rounded text-slate-400 hover:text-rose-600"
                  title="Delete Schedule"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT EXAM SCHEDULE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingItem ? 'Edit Exam Schedule' : 'Schedule Examination Paper'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Examination Assessment
                </label>
                <select
                  value={formExamId}
                  onChange={e => setFormExamId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                >
                  {examinations.map(ex => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Class
                  </label>
                  <select
                    value={formClassNum}
                    onChange={e => setFormClassNum(e.target.value)}
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
                    Subject
                  </label>
                  <select
                    value={formSubject}
                    onChange={e => setFormSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    {subjectsList.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Exam Date
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formStart}
                    onChange={e => setFormStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formEnd}
                    onChange={e => setFormEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Examination Hall / Room
                </label>
                <input
                  type="text"
                  value={formRoom}
                  onChange={e => setFormRoom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                  placeholder="e.g. Hall A (Room 301)"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
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
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Remove Exam Schedule"
        message={`Are you sure you want to delete the scheduled ${itemToDelete?.subject} exam for Class ${itemToDelete?.classNum} on ${itemToDelete?.examDate}?`}
        confirmText="Remove Exam"
        onConfirm={() => {
          if (itemToDelete) {
            onDeleteSchedule(itemToDelete.id);
            showToast('info', 'Schedule Removed', 'Exam slot removed.');
            setItemToDelete(null);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};

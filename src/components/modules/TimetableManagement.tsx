import React, { useState, useMemo } from 'react';
import {
  Clock,
  Plus,
  Printer,
  Trash2,
  Edit2,
  AlertTriangle,
  X,
  User,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { TimetableSlot, Teacher, SchoolProfile } from '../../types';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../common/ConfirmModal';

interface TimetableManagementProps {
  timetable: TimetableSlot[];
  teachers: Teacher[];
  schoolProfile: SchoolProfile;
  onSaveSlot: (slot: TimetableSlot) => void;
  onDeleteSlot: (id: string) => void;
}

export const TimetableManagement: React.FC<TimetableManagementProps> = ({
  timetable,
  teachers,
  schoolProfile,
  onSaveSlot,
  onDeleteSlot,
}) => {
  const { showToast } = useToast();

  const [selectedClass, setSelectedClass] = useState<string>('5');
  const [selectedSection, setSelectedSection] = useState<'A' | 'B' | 'C'>('A');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<TimetableSlot | null>(null);

  // Form state
  const [formWeekday, setFormWeekday] = useState<TimetableSlot['weekday']>('Monday');
  const [formPeriod, setFormPeriod] = useState<number>(1);
  const [formStart, setFormStart] = useState('08:30');
  const [formEnd, setFormEnd] = useState('09:15');
  const [formSubject, setFormSubject] = useState('Mathematics');
  const [formTeacherId, setFormTeacherId] = useState(teachers[0]?.id || '');
  const [formRoom, setFormRoom] = useState('Room 301');

  const daysOfWeek: TimetableSlot['weekday'][] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const standardPeriods = [
    { p: 1, start: '08:30', end: '09:15', label: 'Period 1' },
    { p: 2, start: '09:15', end: '10:00', label: 'Period 2' },
    { p: 3, start: '10:15', end: '11:00', label: 'Period 3' },
    { p: 4, start: '11:00', end: '11:45', label: 'Period 4' },
    { p: 5, start: '12:30', end: '01:15', label: 'Period 5' },
    { p: 6, start: '01:15', end: '02:00', label: 'Period 6' },
  ];

  const teacherMap = useMemo(() => {
    const map: Record<string, Teacher> = {};
    teachers.forEach(t => {
      map[t.id] = t;
    });
    return map;
  }, [teachers]);

  // Timetable entries for selected class & section
  const currentClassSlots = useMemo(() => {
    return timetable.filter(t => t.classNum === selectedClass && t.section === selectedSection);
  }, [timetable, selectedClass, selectedSection]);

  const handleOpenAdd = (day: TimetableSlot['weekday'] = 'Monday', periodNum: number = 1) => {
    setEditingSlot(null);
    setFormWeekday(day);
    setFormPeriod(periodNum);
    const standard = standardPeriods.find(p => p.p === periodNum) || standardPeriods[0];
    setFormStart(standard.start);
    setFormEnd(standard.end);
    setFormSubject('Mathematics');
    setFormTeacherId(teachers[0]?.id || '');
    setFormRoom(`Room ${selectedClass}01`);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setFormWeekday(slot.weekday);
    setFormPeriod(slot.periodNumber);
    setFormStart(slot.startTime);
    setFormEnd(slot.endTime);
    setFormSubject(slot.subject);
    setFormTeacherId(slot.teacherId);
    setFormRoom(slot.room || `Room ${selectedClass}01`);
    setIsModalOpen(true);
  };

  // Conflict Detection
  const checkConflicts = (
    weekday: TimetableSlot['weekday'],
    periodNumber: number,
    teacherId: string,
    currentSlotId?: string
  ): { hasConflict: boolean; reason?: string } => {
    // 1. Check if another slot exists for the SAME class & section at the SAME weekday & period
    const classConflict = timetable.find(
      t =>
        t.id !== currentSlotId &&
        t.classNum === selectedClass &&
        t.section === selectedSection &&
        t.weekday === weekday &&
        t.periodNumber === periodNumber
    );
    if (classConflict) {
      return {
        hasConflict: true,
        reason: `Period Conflict: Class ${selectedClass}-${selectedSection} already has "${classConflict.subject}" scheduled on ${weekday} at Period ${periodNumber}.`,
      };
    }

    // 2. Check if the SAME teacher is already teaching ANY other class at that weekday & period
    const teacherConflict = timetable.find(
      t =>
        t.id !== currentSlotId &&
        t.teacherId === teacherId &&
        t.weekday === weekday &&
        t.periodNumber === periodNumber
    );
    if (teacherConflict) {
      const teacher = teacherMap[teacherId];
      return {
        hasConflict: true,
        reason: `Teacher Conflict: ${teacher ? teacher.name : 'Teacher'} is already assigned to Class ${teacherConflict.classNum}-${teacherConflict.section} (${teacherConflict.subject}) on ${weekday} Period ${periodNumber}.`,
      };
    }

    return { hasConflict: false };
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const conflict = checkConflicts(formWeekday, formPeriod, formTeacherId, editingSlot?.id);
    if (conflict.hasConflict) {
      showToast('error', 'Timetable Conflict', conflict.reason);
      return;
    }

    const payload: TimetableSlot = {
      id: editingSlot ? editingSlot.id : `TT-${selectedClass}${selectedSection}-${formWeekday}-${formPeriod}-${Date.now().toString(36)}`,
      classNum: selectedClass,
      section: selectedSection,
      weekday: formWeekday,
      periodNumber: formPeriod,
      startTime: formStart,
      endTime: formEnd,
      subject: formSubject,
      teacherId: formTeacherId,
      room: formRoom,
    };

    onSaveSlot(payload);
    showToast('success', 'Timetable Updated', `Scheduled ${payload.subject} on ${payload.weekday} Period ${payload.periodNumber}.`);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Class Timetable & Schedule
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Weekly instructional matrix (Mon–Sat) with automated faculty collision detection
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Class & Section Switcher */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-500">Class:</span>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="bg-transparent font-semibold text-slate-900 dark:text-white focus:outline-hidden"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                <option key={c} value={String(c)}>
                  Class {c}
                </option>
              ))}
            </select>

            <span className="text-slate-500 ml-1">Section:</span>
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="A">Sec A</option>
              <option value="B">Sec B</option>
              <option value="C">Sec C</option>
            </select>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-xl font-medium text-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Grid</span>
          </button>

          <button
            onClick={() => handleOpenAdd()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Period</span>
          </button>
        </div>
      </div>

      {/* Timetable Weekly Matrix */}
      <div className="print-container bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900 dark:text-white">
            Weekly Schedule for Class {selectedClass} - Section {selectedSection} ({schoolProfile.academicYear})
          </span>
          <span className="text-slate-400">Monday through Saturday</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4 w-32 border-r border-slate-200 dark:border-slate-800">Weekday</th>
                {standardPeriods.map(p => (
                  <th key={p.p} className="py-3 px-3 text-center border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                    <div>{p.label}</div>
                    <span className="text-[10px] text-slate-400 font-mono normal-case">
                      {p.start} - {p.end}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {daysOfWeek.map(day => (
                <tr key={day} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                    {day}
                  </td>
                  {standardPeriods.map(per => {
                    const slot = currentClassSlots.find(
                      s => s.weekday === day && s.periodNumber === per.p
                    );
                    const teacher = slot ? teacherMap[slot.teacherId] : null;

                    return (
                      <td
                        key={per.p}
                        className="py-2.5 px-2.5 border-r border-slate-200 dark:border-slate-800 last:border-r-0 align-top min-w-[130px]"
                      >
                        {slot ? (
                          <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs flex flex-col justify-between group relative">
                            <div>
                              <p className="font-bold text-slate-900 dark:text-amber-200 leading-tight">
                                {slot.subject}
                              </p>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 truncate">
                                {teacher ? teacher.name : 'Faculty'}
                              </p>
                            </div>
                            <div className="mt-2 pt-1.5 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-[10px] text-slate-400">
                              <span>{slot.room || 'Room 301'}</span>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 print-hide">
                                <button
                                  onClick={() => handleOpenEdit(slot)}
                                  className="text-slate-500 hover:text-blue-600"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setSlotToDelete(slot)}
                                  className="text-slate-500 hover:text-rose-600"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenAdd(day, per.p)}
                            className="w-full h-16 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 text-slate-300 dark:text-slate-600 hover:text-amber-600 flex items-center justify-center transition-all print-hide"
                            title="Add period slot"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT TIMETABLE SLOT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingSlot ? 'Edit Period Slot' : 'Schedule Timetable Period'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Weekday
                  </label>
                  <select
                    value={formWeekday}
                    onChange={e => setFormWeekday(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    {daysOfWeek.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Period Number
                  </label>
                  <select
                    value={formPeriod}
                    onChange={e => {
                      const pNum = parseInt(e.target.value, 10);
                      setFormPeriod(pNum);
                      const std = standardPeriods.find(p => p.p === pNum);
                      if (std) {
                        setFormStart(std.start);
                        setFormEnd(std.end);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    {standardPeriods.map(p => (
                      <option key={p.p} value={p.p}>
                        {p.label} ({p.start}-{p.end})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={formSubject}
                  onChange={e => setFormSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                  placeholder="e.g. Mathematics, Science, Literature"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Instructor
                </label>
                <select
                  value={formTeacherId}
                  onChange={e => setFormTeacherId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.id} · {t.subjects.join('/')})
                    </option>
                  ))}
                </select>
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
                  Room / Laboratory
                </label>
                <input
                  type="text"
                  value={formRoom}
                  onChange={e => setFormRoom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                  placeholder="e.g. Room 301 or Physics Lab"
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
        isOpen={!!slotToDelete}
        title="Remove Timetable Period"
        message={`Are you sure you want to remove ${slotToDelete?.subject} on ${slotToDelete?.weekday} Period ${slotToDelete?.periodNumber}?`}
        confirmText="Remove Slot"
        onConfirm={() => {
          if (slotToDelete) {
            onDeleteSlot(slotToDelete.id);
            showToast('info', 'Slot Removed', 'Period deleted from timetable.');
            setSlotToDelete(null);
          }
        }}
        onCancel={() => setSlotToDelete(null)}
      />
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Plus,
  Send,
  Phone,
  Mail,
  User,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
  Bell,
  Smartphone,
  Share2,
} from 'lucide-react';
import { Announcement, Student, SchoolProfile } from '../../types';
import { useToast } from '../../context/ToastContext';

interface CommunicationManagementProps {
  announcements: Announcement[];
  students: Student[];
  schoolProfile: SchoolProfile;
  onAddAnnouncement: (announcement: Announcement) => void;
  onDeleteAnnouncement: (id: string) => void;
}

export const CommunicationManagement: React.FC<CommunicationManagementProps> = ({
  announcements,
  students,
  schoolProfile,
  onAddAnnouncement,
  onDeleteAnnouncement,
}) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'announcements' | 'directory' | 'broadcast'>('announcements');

  // Announcement Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annAudience, setAnnAudience] = useState('All Classes');
  const [annPriority, setAnnPriority] = useState<Announcement['priority']>('Important');

  // Directory Search
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryClass, setDirectoryClass] = useState('All');

  // Simulated Broadcast
  const [simChannel, setSimChannel] = useState<'SMS' | 'WhatsApp' | 'Email'>('SMS');
  const [simTargetClass, setSimTargetClass] = useState('All Classes');
  const [simText, setSimText] = useState(
    'School Update: Friendly reminder regarding tomorrow’s science exhibition. Please ensure students bring their models by 8:30 AM.'
  );
  const [simModalMessage, setSimModalMessage] = useState<string | null>(null);

  const filteredDirectory = useMemo(() => {
    return students.filter(s => {
      const matchSearch =
        s.parentName.toLowerCase().includes(directorySearch.toLowerCase()) ||
        s.parentPhone.toLowerCase().includes(directorySearch.toLowerCase()) ||
        s.fullName.toLowerCase().includes(directorySearch.toLowerCase()) ||
        s.id.toLowerCase().includes(directorySearch.toLowerCase());
      const matchClass = directoryClass === 'All' || s.classNum === directoryClass;
      return matchSearch && matchClass;
    });
  }, [students, directorySearch, directoryClass]);

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) {
      showToast('error', 'Missing Information', 'Please provide a title and notice message.');
      return;
    }

    const payload: Announcement = {
      id: `ANN-${Date.now()}`,
      title: annTitle.trim(),
      message: annMessage.trim(),
      targetAudience: annAudience,
      publicationDate: new Date().toISOString().split('T')[0],
      priority: annPriority,
      author: schoolProfile.principalName,
    };

    onAddAnnouncement(payload);
    showToast('success', 'Announcement Published', `Circular "${payload.title}" published to ${payload.targetAudience}.`);
    setIsModalOpen(false);
    setAnnTitle('');
    setAnnMessage('');
  };

  const handleTriggerSimulatedSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simText.trim()) {
      showToast('error', 'Empty Message', 'Please enter a message to send.');
      return;
    }

    const recipientCount =
      simTargetClass === 'All Classes'
        ? students.length
        : students.filter(s => s.classNum === simTargetClass.replace('Class ', '')).length;

    setSimModalMessage(
      `Demo Dispatch via ${simChannel}: Successfully queued ${recipientCount} simulated messages to parents of ${simTargetClass}. Note: This is an offline internship frontend simulation; no actual carrier SMS or email network dispatch occurred.`
    );
    showToast('success', 'Simulated Notification Sent', `Dispatched demo message to ${recipientCount} parents.`);
  };

  return (
    <div className="space-y-6">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Parent Communication & Circulars
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Publish school circulars, look up parent directory, and trigger demo dispatch previews
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'announcements'
                  ? 'bg-amber-500 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              School Circulars
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'directory'
                  ? 'bg-amber-500 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Parent Directory
            </button>
            <button
              onClick={() => setActiveTab('broadcast')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'broadcast'
                  ? 'bg-amber-500 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Demo Notification Sender
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Notice</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: CIRCULARS & NOTICES ================= */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map(ann => {
              let priorityBadge = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
              if (ann.priority === 'Urgent') {
                priorityBadge = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400';
              } else if (ann.priority === 'Important') {
                priorityBadge = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';
              }

              return (
                <div
                  key={ann.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${priorityBadge}`}>
                        {ann.priority}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{ann.publicationDate}</span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2 leading-snug">
                      {ann.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                      {ann.message}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Target: <strong className="text-slate-700 dark:text-slate-300">{ann.targetAudience}</strong></span>
                    <span>By: {ann.author}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 2: PARENT DIRECTORY ================= */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex-1 min-w-[220px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search guardian name, phone, student..."
                value={directorySearch}
                onChange={e => setDirectorySearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">Class:</span>
              <select
                value={directoryClass}
                onChange={e => setDirectoryClass(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="All">All Classes</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                  <option key={c} value={String(c)}>
                    Class {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDirectory.map(student => (
              <div
                key={student.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-slate-900 dark:text-white">{student.parentName}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">
                    Class {student.classNum}-{student.section}
                  </span>
                </div>

                <div className="space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{student.parentPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{student.email}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Student: <strong className="text-slate-700 dark:text-slate-200">{student.fullName}</strong></span>
                  <span className="font-mono">{student.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: DEMO NOTIFICATION SENDER ================= */}
      {activeTab === 'broadcast' && (
        <div className="max-w-xl mx-auto p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-xs space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-900/40">
            <Smartphone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-xs">Simulated Notification Dispatcher</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                Note: This simulation allows teachers and administrators to test template broadcasts. Real SMS / WhatsApp / email delivery is not connected in this frontend environment.
              </p>
            </div>
          </div>

          <form onSubmit={handleTriggerSimulatedSend} className="space-y-4">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Dispatch Channel (Simulated)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['SMS', 'WhatsApp', 'Email'] as const).map(ch => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setSimChannel(ch)}
                    className={`py-2 px-3 rounded-xl border font-semibold text-xs transition-colors ${
                      simChannel === ch
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {ch} Preview
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Target Audience</label>
              <select
                value={simTargetClass}
                onChange={e => setSimTargetClass(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="All Classes">All Classes (Entire School)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                  <option key={c} value={`Class ${c}`}>
                    Class {c} Parents
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Simulated Notification Text
              </label>
              <textarea
                rows={4}
                value={simText}
                onChange={e => setSimText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                placeholder="Type communication message here..."
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Simulate Broadcast to Parents</span>
            </button>
          </form>
        </div>
      )}

      {/* SIMULATED RESULT MODAL */}
      {simModalMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-xs text-slate-800 dark:text-slate-100">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Simulated Broadcast Sent</h3>
                <p className="text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{simModalMessage}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSimModalMessage(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PUBLISH ANNOUNCEMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Publish Notice Circular</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-4">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Circular Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={e => setAnnTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                  placeholder="e.g. Annual Sports Meet 2026"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Audience
                </label>
                <select
                  value={annAudience}
                  onChange={e => setAnnAudience(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="All Classes">All Classes</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                    <option key={c} value={`Class ${c}`}>
                      Class {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Normal', 'Important', 'Urgent'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAnnPriority(p)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                        annPriority === p
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Message Content <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={annMessage}
                  onChange={e => setAnnMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                  placeholder="Enter circular contents..."
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
                  Publish Circular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

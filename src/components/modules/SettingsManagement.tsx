import React, { useState } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  Download,
  Upload,
  School,
  Moon,
  Sun,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { SchoolProfile } from '../../types';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../common/ConfirmModal';

interface SettingsManagementProps {
  schoolProfile: SchoolProfile;
  onUpdateSchoolProfile: (profile: SchoolProfile) => void;
  onResetDatabase: () => void;
  onExportJSON: () => void;
  onImportJSON: (jsonString: string) => boolean;
  isDark: boolean;
  onToggleDark: () => void;
}

export const SettingsManagement: React.FC<SettingsManagementProps> = ({
  schoolProfile,
  onUpdateSchoolProfile,
  onResetDatabase,
  onExportJSON,
  onImportJSON,
  isDark,
  onToggleDark,
}) => {
  const { showToast } = useToast();

  const [formData, setFormData] = useState<SchoolProfile>({ ...schoolProfile });
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchoolProfile(formData);
    showToast('success', 'Profile Saved', 'School information and academic session updated.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        const content = ev.target?.result as string;
        const success = onImportJSON(content);
        if (success) {
          showToast('success', 'Backup Restored', 'Database backup imported successfully.');
        } else {
          showToast('error', 'Import Failed', 'Invalid JSON backup file schema.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          System & Institution Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure school identity, academic session year, theme styling, and persistent storage
        </p>
      </div>

      {/* School Profile Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Institution Profile</h2>
            <p className="text-[11px] text-slate-400">Printed on receipts, reports, and official report cards</p>
          </div>
        </div>

        <form onSubmit={handleSubmitProfile} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Institution Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                School Motto / Tagline
              </label>
              <input
                type="text"
                value={formData.motto}
                onChange={e => setFormData({ ...formData, motto: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Head of School / Principal
              </label>
              <input
                type="text"
                value={formData.principalName}
                onChange={e => setFormData({ ...formData, principalName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Active Academic Year
              </label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Campus Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Visual Theme Settings */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Interface Appearance</h2>
        <p className="text-slate-400 mb-4">Toggle between clean daylight mode and dark console mode</p>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-amber-600" />}
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {isDark ? 'Dark Mode Active' : 'Light Mode Active'}
              </p>
              <p className="text-[11px] text-slate-400">Saved in browser localStorage</p>
            </div>
          </div>
          <button
            onClick={onToggleDark}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors"
          >
            Switch to {isDark ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      {/* Storage, Backup & Factory Reset */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Data Management & Backup</h2>
          <p className="text-slate-400 mt-0.5">
            SchoolPro operates 100% on browser localStorage. Export your database or restore demo records anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={onExportJSON}
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Download Database Backup (JSON)</span>
          </button>

          <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200 cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-blue-500" />
            <span>Restore From JSON Backup</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="font-semibold text-rose-600 dark:text-rose-400">Reset Demo Database</p>
            <p className="text-[11px] text-slate-400">
              Restore default 20+ students, faculty, timetables, and fee structures.
            </p>
          </div>
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 rounded-xl font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* CONFIRM RESET MODAL */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        title="Reset All SchoolPro Data?"
        message="This will re-initialize the system with original sample students, faculty rosters, timetables, attendance, and fee ledgers. All custom changes will be replaced."
        confirmText="Yes, Reset Everything"
        onConfirm={() => {
          onResetDatabase();
          showToast('info', 'Demo Data Restored', 'SchoolPro has been reset to initial demo state.');
          setIsResetModalOpen(false);
        }}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
};

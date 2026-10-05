import React, { useState, useEffect, useRef } from 'react';
import {
  Building,
  Save,
  Download,
  Upload,
  Trash2,
  Info,
  Check,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { db } from '../services/storage';
import { getTodayDateString } from '../utils/formatters';
import type { PengaturanSekolah } from '../types';

interface PengaturanScreenProps {
  onNavigateAbout: () => void;
}

export const PengaturanScreen: React.FC<PengaturanScreenProps> = ({
  onNavigateAbout,
}) => {
  const [settings, setSettings] = useState<PengaturanSekolah>(db.getPengaturan());
  const [saveToast, setSaveToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Dialog States
  const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = useState(false);
  const [pendingRestoreJson, setPendingRestoreJson] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    db.savePengaturan(settings);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // Backup JSON (Section 18)
  const handleBackupJson = () => {
    const jsonStr = db.exportBackupJsonString();
    const today = getTodayDateString();
    const filename = `simsis_backup_${today}.json`;

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // File Picker Trigger
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setPendingRestoreJson(content);
        setIsRestoreConfirmOpen(true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Execute Restore (Section 19)
  const handleConfirmRestore = () => {
    if (!pendingRestoreJson) return;

    const result = db.restoreBackupJsonString(pendingRestoreJson);
    setIsRestoreConfirmOpen(false);
    setPendingRestoreJson(null);

    if (result.success) {
      setSettings(db.getPengaturan());
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    } else {
      setErrorMessage(result.message);
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // Reset All Data (Section 27)
  const handleConfirmReset = () => {
    db.resetAllData();
    setSettings(db.getPengaturan());
    setIsResetConfirmOpen(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 pb-28">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>Pengaturan berhasil diperbarui.</span>
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-20 shadow-xs">
        <h2 className="text-sm font-bold text-slate-800">Pengaturan</h2>
        <p className="text-[11px] text-slate-400">Konfigurasi sekolah dan manajemen data</p>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto w-full">
        {/* Identitas Sekolah Form (Section 20) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-3.5 pb-2.5 border-b border-slate-100">
            <Building className="w-4 h-4 text-blue-700" />
            <span>Identitas Sekolah & Kelas</span>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Nama Sekolah
              </label>
              <input
                type="text"
                value={settings.namaSekolah}
                onChange={(e) => setSettings({ ...settings, namaSekolah: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Alamat Sekolah
              </label>
              <input
                type="text"
                value={settings.alamat}
                onChange={(e) => setSettings({ ...settings, alamat: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Nama Wali Kelas / Guru
                </label>
                <input
                  type="text"
                  value={settings.namaWaliKelas}
                  onChange={(e) => setSettings({ ...settings, namaWaliKelas: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Tahun Ajaran
                </label>
                <input
                  type="text"
                  value={settings.tahunAjaran}
                  onChange={(e) => setSettings({ ...settings, tahunAjaran: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1.5 mt-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Identitas</span>
            </button>
          </form>
        </div>

        {/* Database Backup & Restore (Section 18 & 19) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 pb-2.5 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cadangan & Pemulihan (Backup / Restore)</span>
          </div>

          <p className="text-xs text-slate-500">
            Simpan salinan data siswa, transaksi, dan pengaturan ke file JSON yang dapat dipulihkan kapan saja.
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={handleBackupJson}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200 active:scale-95"
            >
              <Download className="w-4 h-4 text-blue-700" />
              <span>Backup JSON</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200 active:scale-95"
            >
              <Upload className="w-4 h-4 text-emerald-700" />
              <span>Restore JSON</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Tentang Aplikasi Link (Section 21) */}
        <button
          onClick={onNavigateAbout}
          className="w-full bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between hover:bg-slate-50 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-xs font-bold text-slate-800">Tentang Aplikasi SimSis</h3>
              <p className="text-[11px] text-slate-400">Versi 1.0.0 · MSD Temanggung by Umar</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Danger Zone: Reset Data (Section 27) */}
        <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4">
          <h4 className="text-xs font-bold text-rose-800 mb-1 flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Zona Bahaya: Reset Database</span>
          </h4>
          <p className="text-[11px] text-rose-700 mb-3">
            Kembalikan data ke contoh awal atau bersihkan semua pencatatan.
          </p>
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-xs"
          >
            Hapus Semua Data
          </button>
        </div>
      </div>

      {/* Restore Confirmation Dialog (Section 19) */}
      {isRestoreConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 mb-1.5">
              Konfirmasi Pemulihan Data
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Restore akan mengganti data aplikasi saat ini. Pastikan Anda sudah melakukan backup. Lanjutkan?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsRestoreConfirmOpen(false);
                  setPendingRestoreJson(null);
                }}
                className="flex-1 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmRestore}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog (Section 27) */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-rose-700 mb-1.5">
              PERINGATAN KERAS
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Semua data siswa dan transaksi akan dihapus dan tidak dapat dikembalikan.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  UserPlus,
  ChevronRight,
  Filter,
  Phone,
  Trash2,
  Edit2,
  Plus,
  X,
  Check,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { db, subscribeToDatabase } from '../services/storage';
import { formatRupiah } from '../utils/formatters';
import type { SiswaWithBalance, Kelas, JenisKelamin } from '../types';

interface SiswaScreenProps {
  onSelectSiswa: (siswaId: string) => void;
  onOpenTambahTransaksi: (siswaId?: string, jenis?: 'SETORAN' | 'PENARIKAN') => void;
}

export const SiswaScreen: React.FC<SiswaScreenProps> = ({
  onSelectSiswa,
  onOpenTambahTransaksi,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKelasId, setSelectedKelasId] = useState('ALL');
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [siswaList, setSiswaList] = useState<SiswaWithBalance[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSiswaId, setEditingSiswaId] = useState<string | null>(null);

  // Form Fields
  const [formNama, setFormNama] = useState('');
  const [formNis, setFormNis] = useState('');
  const [formKelasId, setFormKelasId] = useState('');
  const [formCustomKelas, setFormCustomKelas] = useState('');
  const [formJenisKelamin, setFormJenisKelamin] = useState<JenisKelamin>('L');
  const [formWhatsApp, setFormWhatsApp] = useState('');
  const [formError, setFormError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Delete Confirm State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadData = () => {
    const kList = db.getKelasList();
    setKelasList(kList);
    if (!formKelasId && kList.length > 0) {
      setFormKelasId(kList[0].id);
    }
    const sList = db.getSiswaWithBalances(selectedKelasId, searchQuery);
    setSiswaList(sList);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDatabase(loadData);
    return () => unsubscribe();
  }, [selectedKelasId, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingSiswaId(null);
    setFormNama('');
    setFormNis('');
    setFormKelasId(kelasList[0]?.id || 'NEW');
    setFormCustomKelas(kelasList.length === 0 ? '5A' : '');
    setFormJenisKelamin('L');
    setFormWhatsApp('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (siswa: SiswaWithBalance, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSiswaId(siswa.id);
    setFormNama(siswa.namaSiswa);
    setFormNis(siswa.nis);
    setFormKelasId(siswa.kelasId);
    setFormCustomKelas('');
    setFormJenisKelamin(siswa.jenisKelamin);
    setFormWhatsApp(siswa.nomorWhatsApp || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveSiswa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) {
      setFormError('Nama siswa wajib diisi.');
      return;
    }

    let targetKelasId = formKelasId;

    if (formKelasId === 'NEW' || kelasList.length === 0) {
      const customName = formCustomKelas.trim();
      if (!customName) {
        setFormError('Nama kelas wajib diisi.');
        return;
      }

      // Check if existing
      const existing = kelasList.find(
        (k) => k.namaKelas.toLowerCase() === customName.toLowerCase()
      );
      if (existing) {
        targetKelasId = existing.id;
      } else {
        const newKelas: Kelas = {
          id: `k-${Date.now()}`,
          namaKelas: customName,
          namaWaliKelas: '',
          tahunAjaran: '2026/2027',
          createdAt: new Date().toISOString(),
        };
        db.saveKelas(newKelas);
        targetKelasId = newKelas.id;
      }
    }

    if (!targetKelasId) {
      setFormError('Kelas wajib dipilih.');
      return;
    }

    const siswaData = {
      id: editingSiswaId || `s-${Date.now()}`,
      namaSiswa: formNama.trim(),
      nis: formNis.trim(),
      kelasId: targetKelasId,
      jenisKelamin: formJenisKelamin,
      nomorWhatsApp: formWhatsApp.trim() || undefined,
      statusAktif: true,
      createdAt: new Date().toISOString(),
    };

    db.saveSiswa(siswaData);
    setIsModalOpen(false);
    setSuccessToast(
      editingSiswaId ? 'Perubahan data siswa berhasil disimpan.' : 'Data siswa berhasil disimpan.'
    );
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleDeleteSiswa = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    db.deleteSiswa(id, true);
    setDeleteConfirmId(null);
    setSuccessToast('Siswa berhasil dinonaktifkan.');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 pb-28">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Search & Filter Header */}
      <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-20 shadow-xs space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari siswa atau NIS..."
            className="w-full pl-9 pr-8 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Kelas horizontal segmented scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedKelasId('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedKelasId === 'ALL'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Kelas ({db.getSiswaList(true).length})
          </button>
          {kelasList.map((k) => (
            <button
              key={k.id}
              onClick={() => setSelectedKelasId(k.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedKelasId === k.id
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Kelas {k.namaKelas}
            </button>
          ))}
        </div>
      </div>

      {/* Action Subbar */}
      <div className="px-4 py-2.5 flex items-center justify-between text-xs text-slate-500">
        <span>Menampilkan {siswaList.length} siswa</span>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl active:scale-95 transition-all shadow-xs"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>+ Tambah Siswa</span>
        </button>
      </div>

      {/* Student List */}
      <div className="px-4 space-y-2.5">
        {siswaList.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 mt-4">
            <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">Belum ada data siswa.</p>
            <p className="text-[11px] text-slate-400 mt-1">
              {searchQuery
                ? 'Tidak ada siswa yang cocok dengan pencarian.'
                : 'Mulai dengan menambahkan siswa ke dalam sistem.'}
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 shadow-xs inline-flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Tambah Siswa</span>
            </button>
          </div>
        ) : (
          siswaList.map((siswa, idx) => (
            <div
              key={siswa.id}
              onClick={() => onSelectSiswa(siswa.id)}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 cursor-pointer active:bg-slate-50 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Index / Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                    siswa.jenisKelamin === 'P'
                      ? 'bg-rose-50 text-rose-700 border border-rose-100'
                      : 'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}
                >
                  {idx + 1}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                      {siswa.namaSiswa}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {siswa.nis}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span className="font-semibold text-slate-600">
                      Kelas {siswa.kelasNama}
                    </span>
                    {siswa.nomorWhatsApp && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-0.5 text-emerald-600">
                          <Phone className="w-2.5 h-2.5" />
                          <span>WA</span>
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Balance & Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <p className="text-xs font-extrabold text-blue-700 font-mono">
                    {formatRupiah(siswa.saldo)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {siswa.jumlahTransaksi} transaksi
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100">
                  <button
                    onClick={(e) => handleOpenEditModal(siswa, e)}
                    title="Edit Data Siswa"
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(siswa.id);
                    }}
                    title="Hapus Siswa"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: Tambah / Edit Siswa (Section 7) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-blue-700 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingSiswaId ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-blue-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSiswa} className="p-5 space-y-3.5">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Contoh: Ahmad Fauzan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIS
                  </label>
                  <input
                    type="text"
                    value={formNis}
                    onChange={(e) => setFormNis(e.target.value)}
                    placeholder="12345"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kelas <span className="text-rose-500">*</span>
                  </label>
                  {kelasList.length === 0 ? (
                    <input
                      type="text"
                      required
                      value={formCustomKelas}
                      onChange={(e) => setFormCustomKelas(e.target.value)}
                      placeholder="Contoh: 5A"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    />
                  ) : (
                    <select
                      value={formKelasId}
                      onChange={(e) => setFormKelasId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    >
                      {kelasList.map((k) => (
                        <option key={k.id} value={k.id}>
                          Kelas {k.namaKelas}
                        </option>
                      ))}
                      <option value="NEW">+ Tambah Kelas Baru...</option>
                    </select>
                  )}
                </div>
              </div>

              {formKelasId === 'NEW' && kelasList.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Kelas Baru <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCustomKelas}
                    onChange={(e) => setFormCustomKelas(e.target.value)}
                    placeholder="Contoh: 5B, 6A"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jenis Kelamin
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormJenisKelamin('L')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                      formJenisKelamin === 'L'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 ring-1 ring-blue-600'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Laki-Laki
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormJenisKelamin('P')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                      formJenisKelamin === 'P'
                        ? 'bg-rose-50 border-rose-600 text-rose-700 ring-1 ring-rose-600'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Perempuan
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor WhatsApp <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="tel"
                  value={formWhatsApp}
                  onChange={(e) => setFormWhatsApp(e.target.value)}
                  placeholder="Contoh: 082138950006"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Digunakan untuk mengirim bukti transaksi dan laporan tabungan.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-3 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-700/20 active:scale-95 transition-all"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Delete Siswa (Section 27) */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 mb-1">
              Hapus Siswa?
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Apakah Anda yakin ingin menghapus siswa ini? Histori transaksi tetap tersimpan aman.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteSiswa(deleteConfirmId)}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

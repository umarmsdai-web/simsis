import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Filter,
  User,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  Trash2,
  FileSpreadsheet,
} from 'lucide-react';
import { db, subscribeToDatabase } from '../services/storage';
import {
  formatRupiah,
  formatTanggalRingkas,
  formatTanggalIndo,
  getTodayDateString,
} from '../utils/formatters';
import { WhatsAppModal } from '../components/WhatsAppModal';
import type { SiswaWithBalance, MutasiRow } from '../types';

interface MutasiScreenProps {
  initialSiswaId?: string;
  onBack?: () => void;
}

export const MutasiScreen: React.FC<MutasiScreenProps> = ({
  initialSiswaId,
  onBack,
}) => {
  const [siswaList, setSiswaList] = useState<SiswaWithBalance[]>([]);
  const [selectedSiswaId, setSelectedSiswaId] = useState(initialSiswaId || '');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState(getTodayDateString());

  const [mutasiRows, setMutasiRows] = useState<MutasiRow[]>([]);
  const [deleteConfirmTxId, setDeleteConfirmTxId] = useState<string | null>(null);

  // WhatsApp Share Modal
  const [isWaOpen, setIsWaOpen] = useState(false);
  const [waText, setWaText] = useState('');

  const loadData = () => {
    const list = db.getSiswaWithBalances('ALL');
    setSiswaList(list);

    let activeId = selectedSiswaId;
    if (!activeId && list.length > 0) {
      activeId = list[0].id;
      setSelectedSiswaId(activeId);
    }

    if (activeId) {
      const rows = db.getMutasiForSiswa(activeId, filterPeriod, startDate, endDate);
      setMutasiRows(rows);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDatabase(loadData);
    return () => unsubscribe();
  }, [selectedSiswaId, filterPeriod, startDate, endDate]);

  const selectedSiswa = siswaList.find((s) => s.id === selectedSiswaId);

  const handleDeleteTx = (txId: string) => {
    db.deleteTransaksi(txId);
    setDeleteConfirmTxId(null);
  };

  const handleShareMutasiWhatsApp = () => {
    if (!selectedSiswa) return;

    let text = `*MUTASI SIMPANAN SISWA*\n\n`;
    text += `Nama: ${selectedSiswa.namaSiswa}\n`;
    text += `Kelas: ${selectedSiswa.kelasNama}\n`;
    text += `Saldo Saat Ini: ${formatRupiah(selectedSiswa.saldo)}\n`;
    text += `Periode: ${
      filterPeriod === 'today'
        ? 'Hari Ini'
        : filterPeriod === 'week'
        ? '7 Hari Terakhir'
        : filterPeriod === 'month'
        ? 'Bulan Ini'
        : 'Semua Transaksi'
    }\n\n`;

    mutasiRows.forEach((row, i) => {
      const isSetor = row.jenisTransaksi === 'SETORAN';
      text += `${i + 1}. ${formatTanggalRingkas(row.tanggal)} | ${row.keterangan}\n`;
      text += `   ${isSetor ? 'Setoran (+)' : 'Penarikan (-)'}: ${formatRupiah(isSetor ? row.masuk : row.keluar)}\n`;
      text += `   Saldo: ${formatRupiah(row.saldoBerjalan)}\n\n`;
    });

    text += `Dibuat oleh SimSis - MSD Temanggung by Umar`;
    setWaText(text);
    setIsWaOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 pb-28">
      {/* Top Bar */}
      <div className="bg-blue-700 text-white p-4 sticky top-0 z-20 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 -ml-1 text-white hover:bg-blue-800 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-sm font-bold">Mutasi Simpanan</h2>
            <p className="text-[11px] text-blue-100">Riwayat debit & kredit siswa</p>
          </div>
        </div>

        {selectedSiswa && (
          <button
            onClick={handleShareMutasiWhatsApp}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim WA</span>
          </button>
        )}
      </div>

      <div className="p-4 space-y-3.5">
        {siswaList.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center mt-4">
            <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">Belum ada data siswa.</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Tambahkan data siswa terlebih dahulu untuk melihat mutasi transaksi.
            </p>
          </div>
        ) : (
          <>
            {/* Siswa Selector Dropdown */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pilih Siswa
              </label>
              <select
                value={selectedSiswaId}
                onChange={(e) => setSelectedSiswaId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {siswaList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.namaSiswa} (Kelas {s.kelasNama} - Saldo: {formatRupiah(s.saldo)})
                  </option>
                ))}
              </select>

              {/* Student Banner */}
              {selectedSiswa && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{selectedSiswa.namaSiswa}</p>
                    <p className="text-[11px] text-slate-500">
                      Kelas {selectedSiswa.kelasNama} · NIS: {selectedSiswa.nis || '-'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Saldo Saat Ini</p>
                    <p className="text-sm font-black font-mono text-blue-700">
                      {formatRupiah(selectedSiswa.saldo)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Filter Period Buttons (Section 12) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'today', label: 'Hari Ini' },
            { id: 'week', label: 'Minggu Ini' },
            { id: 'month', label: 'Bulan Ini' },
            { id: 'custom', label: 'Rentang Tanggal' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterPeriod(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                filterPeriod === tab.id
                  ? 'bg-blue-700 text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Custom Date Range Picker */}
        {filterPeriod === 'custom' && (
          <div className="bg-white p-3 rounded-2xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Mutasi Table (Section 12) */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
            Buku Mutasi ({mutasiRows.length} transaksi)
          </h3>

          {mutasiRows.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <p className="text-xs text-slate-400 font-medium">
                Belum ada mutasi transaksi pada periode ini.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/80 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Tanggal</th>
                      <th className="py-2.5 px-2">Keterangan</th>
                      <th className="py-2.5 px-2 text-right">Masuk</th>
                      <th className="py-2.5 px-2 text-right">Keluar</th>
                      <th className="py-2.5 px-3 text-right">Saldo</th>
                      <th className="py-2.5 px-2 text-center w-8">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {mutasiRows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                          {formatTanggalRingkas(row.tanggal)}
                        </td>
                        <td className="py-2.5 px-2 font-sans text-slate-800">
                          {row.keterangan}
                        </td>
                        <td className="py-2.5 px-2 text-right text-emerald-600 font-bold whitespace-nowrap">
                          {row.masuk > 0 ? formatRupiah(row.masuk) : '-'}
                        </td>
                        <td className="py-2.5 px-2 text-right text-rose-600 font-bold whitespace-nowrap">
                          {row.keluar > 0 ? formatRupiah(row.keluar) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-blue-800 whitespace-nowrap">
                          {formatRupiah(row.saldoBerjalan)}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            onClick={() => setDeleteConfirmTxId(row.id)}
                            title="Hapus Transaksi"
                            className="p-1 text-slate-300 hover:text-rose-600 rounded-md hover:bg-slate-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Tx Confirmation */}
      {deleteConfirmTxId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 text-center">
            <h3 className="font-bold text-sm text-slate-800 mb-1">
              Hapus Transaksi Ini?
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Apakah Anda yakin ingin menghapus transaksi ini? Saldo akan dihitung ulang secara otomatis.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmTxId(null)}
                className="flex-1 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteTx(deleteConfirmTxId)}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      <WhatsAppModal
        isOpen={isWaOpen}
        onClose={() => setIsWaOpen(false)}
        phone={selectedSiswa?.nomorWhatsApp}
        recipientName={selectedSiswa?.namaSiswa}
        messageText={waText}
        title="Bagikan Mutasi Tabungan"
      />
    </div>
  );
};

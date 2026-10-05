import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Send,
  Printer,
  Filter,
  Check,
  Building,
  GraduationCap,
} from 'lucide-react';
import { db, subscribeToDatabase } from '../services/storage';
import {
  formatRupiah,
  getTodayDateString,
  formatTanggalIndo,
} from '../utils/formatters';
import { buildLaporanWhatsAppText } from '../utils/whatsapp';
import { downloadLaporanPdf } from '../utils/pdfExport';
import { WhatsAppModal } from '../components/WhatsAppModal';
import type { Kelas, Siswa, RekapLaporan } from '../types';

export const LaporanScreen: React.FC = () => {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);

  // Filter States (Section 14)
  const [selectedKelasId, setSelectedKelasId] = useState('ALL');
  const [selectedSiswaId, setSelectedSiswaId] = useState('ALL');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState(getTodayDateString());

  // Report Data
  const [rekapRows, setRekapRows] = useState<RekapLaporan[]>([]);
  const [totalSetoran, setTotalSetoran] = useState(0);
  const [totalPenarikan, setTotalPenarikan] = useState(0);
  const [totalSaldo, setTotalSaldo] = useState(0);

  // Modals & Feedback
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [waReportText, setWaReportText] = useState('');
  const [downloadSuccessToast, setDownloadSuccessToast] = useState(false);

  const loadData = () => {
    const kList = db.getKelasList();
    setKelasList(kList);
    const sList = db.getSiswaList(true);
    setSiswaList(sList);

    const result = db.getRekapLaporan(
      selectedKelasId,
      selectedSiswaId,
      filterPeriod,
      startDate,
      endDate
    );

    setRekapRows(result.rows);
    setTotalSetoran(result.totalSetoran);
    setTotalPenarikan(result.totalPenarikan);
    setTotalSaldo(result.totalSaldo);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDatabase(loadData);
    return () => unsubscribe();
  }, [selectedKelasId, selectedSiswaId, filterPeriod, startDate, endDate]);

  const activeKelas = kelasList.find((k) => k.id === selectedKelasId);
  const activeKelasNama = activeKelas ? `Kelas ${activeKelas.namaKelas}` : 'Semua Kelas';

  const getPeriodeString = () => {
    if (filterPeriod === 'today') return 'Hari Ini';
    if (filterPeriod === 'week') return '7 Hari Terakhir';
    if (filterPeriod === 'month') return 'Bulan Ini';
    if (filterPeriod === 'custom') return `${formatTanggalIndo(startDate)} s.d. ${formatTanggalIndo(endDate)}`;
    return 'Semua Transaksi';
  };

  // WhatsApp Share Handler (Section 16)
  const handleShareWhatsApp = () => {
    const msg = buildLaporanWhatsAppText(
      activeKelasNama,
      getPeriodeString(),
      rekapRows,
      totalSaldo
    );
    setWaReportText(msg);
    setIsWaModalOpen(true);
  };

  // PDF Export Handler (Section 17)
  const handleExportPdf = () => {
    const settings = db.getPengaturan();
    downloadLaporanPdf({
      sekolah: settings,
      namaKelas: activeKelasNama,
      waliKelas: activeKelas?.namaWaliKelas || settings.namaWaliKelas,
      tahunAjaran: activeKelas?.tahunAjaran || settings.tahunAjaran,
      periode: getPeriodeString(),
      data: rekapRows,
      totalSetoran,
      totalPenarikan,
      totalSaldo,
    });
    setDownloadSuccessToast(true);
    setTimeout(() => setDownloadSuccessToast(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 pb-28">
      {/* Toast */}
      {downloadSuccessToast && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>Laporan PDF berhasil diunduh.</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-20 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Laporan Simpanan</h2>
          <p className="text-[11px] text-slate-400">Rekapitulasi tabungan siswa</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShareWhatsApp}
            title="Bagikan ke WhatsApp"
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs active:scale-95 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            onClick={handleExportPdf}
            title="Export ke PDF"
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Filters Card (Section 14) */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filter Laporan</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Filter Kelas */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Filter Kelas
              </label>
              <select
                value={selectedKelasId}
                onChange={(e) => {
                  setSelectedKelasId(e.target.value);
                  setSelectedSiswaId('ALL');
                }}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-600"
              >
                <option value="ALL">Semua Kelas</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>
                    Kelas {k.namaKelas}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Siswa */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Filter Siswa
              </label>
              <select
                value={selectedSiswaId}
                onChange={(e) => setSelectedSiswaId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-600"
              >
                <option value="ALL">Semua Siswa</option>
                {siswaList
                  .filter((s) => selectedKelasId === 'ALL' || s.kelasId === selectedKelasId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.namaSiswa}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Filter Periode */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Periode Waktu
            </label>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'today', label: 'Hari Ini' },
                { id: 'week', label: 'Minggu Ini' },
                { id: 'month', label: 'Bulan Ini' },
                { id: 'custom', label: 'Pilih Tanggal' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setFilterPeriod(p.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-colors ${
                    filterPeriod === p.id
                      ? 'bg-blue-700 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {filterPeriod === 'custom' && (
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          )}
        </div>

        {/* Total Summary Banner (Section 13, 15) */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-4 text-white shadow-md">
          <div className="flex items-center justify-between text-xs text-blue-200 mb-1">
            <span>Rekap {activeKelasNama}</span>
            <span>{rekapRows.length} Siswa</span>
          </div>

          <div className="text-2xl font-black font-mono tracking-tight text-white mb-3">
            {formatRupiah(totalSaldo)}
            <span className="text-xs font-normal text-blue-200 ml-2">Total Saldo Bersih</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-white/15 text-xs font-mono">
            <div>
              <span className="text-blue-200 block text-[10px] uppercase font-sans">Setoran Periode Ini</span>
              <span className="text-emerald-300 font-bold">+{formatRupiah(totalSetoran)}</span>
            </div>
            <div>
              <span className="text-blue-200 block text-[10px] uppercase font-sans">Penarikan Periode Ini</span>
              <span className="text-rose-300 font-bold">-{formatRupiah(totalPenarikan)}</span>
            </div>
          </div>
        </div>

        {/* Rekap Table (Section 13) */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tabel Rekapitulasi Siswa
            </h3>
            <button
              onClick={handlePrint}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
          </div>

          {rekapRows.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Belum ada data untuk ditampilkan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-8">No</th>
                    <th className="py-2.5 px-3">Nama Siswa</th>
                    <th className="py-2.5 px-2 text-right">Setoran</th>
                    <th className="py-2.5 px-2 text-right">Penarikan</th>
                    <th className="py-2.5 px-3 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {rekapRows.map((r, idx) => (
                    <tr key={r.siswaId} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 text-center text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-800">
                        <div>{r.namaSiswa}</div>
                        {r.nis && <span className="text-[10px] text-slate-400 font-mono font-normal">NIS: {r.nis}</span>}
                      </td>
                      <td className="py-2.5 px-2 text-right text-emerald-600 font-bold whitespace-nowrap">
                        {formatRupiah(r.totalSetoran)}
                      </td>
                      <td className="py-2.5 px-2 text-right text-rose-600 font-bold whitespace-nowrap">
                        {formatRupiah(r.totalPenarikan)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-blue-800 font-black whitespace-nowrap">
                        {formatRupiah(r.saldo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-mono text-xs font-bold text-slate-800">
                  <tr>
                    <td colSpan={2} className="py-3 px-3 font-sans uppercase text-[11px]">
                      TOTAL SALDO
                    </td>
                    <td className="py-3 px-2 text-right text-emerald-700 whitespace-nowrap">
                      {formatRupiah(totalSetoran)}
                    </td>
                    <td className="py-3 px-2 text-right text-rose-700 whitespace-nowrap">
                      {formatRupiah(totalPenarikan)}
                    </td>
                    <td className="py-3 px-3 text-right text-blue-900 font-black whitespace-nowrap">
                      {formatRupiah(totalSaldo)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp Modal for sharing reports */}
      <WhatsAppModal
        isOpen={isWaModalOpen}
        onClose={() => setIsWaModalOpen(false)}
        messageText={waReportText}
        title="Bagikan Laporan ke WhatsApp"
      />
    </div>
  );
};

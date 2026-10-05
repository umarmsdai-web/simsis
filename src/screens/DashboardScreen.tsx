import React, { useState, useEffect } from 'react';
import {
  Users,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  BookOpen,
  ArrowLeftRight,
  FileSpreadsheet,
  Settings,
  PlusCircle,
  Clock,
  Sparkles,
  Search,
} from 'lucide-react';
import { db, subscribeToDatabase } from '../services/storage';
import { formatRupiah, formatTanggalIndo } from '../utils/formatters';
import type { Transaksi, ActiveTab } from '../types';

interface DashboardScreenProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenDetailSiswa: (siswaId: string) => void;
  onOpenTambahTransaksi: (defaultSiswaId?: string, defaultJenis?: 'SETORAN' | 'PENARIKAN') => void;
  onOpenMutasi: (siswaId?: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigate,
  onOpenDetailSiswa,
  onOpenTambahTransaksi,
  onOpenMutasi,
}) => {
  const [metrics, setMetrics] = useState(db.getDashboardMetrics());
  const [recentTx, setRecentTx] = useState<Transaksi[]>([]);
  const [siswaMap, setSiswaMap] = useState<Map<string, { nama: string; kelas: string }>>(new Map());

  const refreshData = () => {
    setMetrics(db.getDashboardMetrics());
    const allTx = db.getTransaksiList();
    setRecentTx(allTx.slice(0, 5));

    const sList = db.getSiswaList(false);
    const kList = db.getKelasList();
    const kMap = new Map(kList.map((k) => [k.id, k.namaKelas]));

    const map = new Map<string, { nama: string; kelas: string }>();
    sList.forEach((s) => {
      map.set(s.id, {
        nama: s.namaSiswa,
        kelas: kMap.get(s.kelasId) || '-',
      });
    });
    setSiswaMap(map);
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = subscribeToDatabase(refreshData);
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 pb-28">
      {/* Banner Card / Total Simpanan */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-blue-200 uppercase tracking-wider">
            Total Simpanan Seluruh Siswa
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium bg-blue-600/40 text-blue-100 px-2.5 py-0.5 rounded-full border border-blue-400/20">
            <Sparkles className="w-3 h-3 text-amber-300" />
            Kas Aktif
          </span>
        </div>

        <div className="text-3xl font-extrabold tracking-tight font-mono text-white mb-4">
          {formatRupiah(metrics.totalSaldo)}
        </div>

        {/* 3 Metric Mini Cards */}
        <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-blue-600/40">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
            <div className="flex items-center gap-1 text-blue-200 text-[11px] mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>Siswa</span>
            </div>
            <p className="text-base font-bold text-white font-mono leading-none">
              {metrics.jumlahSiswa}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
            <div className="flex items-center gap-1 text-emerald-300 text-[11px] mb-1">
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-300" />
              <span>Setor Hari Ini</span>
            </div>
            <p className="text-xs font-bold text-emerald-200 font-mono truncate leading-none">
              {formatRupiah(metrics.setoranHariIni)}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
            <div className="flex items-center gap-1 text-rose-300 text-[11px] mb-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-300" />
              <span>Tarik Hari Ini</span>
            </div>
            <p className="text-xs font-bold text-rose-200 font-mono truncate leading-none">
              {formatRupiah(metrics.penarikanHariIni)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Quick Menu (5 Grid items as specified in Section 5) */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Menu Utama
            </h2>
            <span className="text-[11px] text-slate-400">Pilih menu</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            <button
              onClick={() => onNavigate('siswa')}
              className="flex flex-col items-center p-2.5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm active:scale-95 transition-all text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-1.5 group-hover:bg-blue-100 transition-colors">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 group-hover:text-blue-700 leading-tight">
                Data Siswa
              </span>
            </button>

            <button
              onClick={() => onOpenTambahTransaksi()}
              className="flex flex-col items-center p-2.5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-sm active:scale-95 transition-all text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1.5 group-hover:bg-emerald-100 transition-colors">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 group-hover:text-emerald-700 leading-tight">
                Transaksi
              </span>
            </button>

            <button
              onClick={() => onOpenMutasi()}
              className="flex flex-col items-center p-2.5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-sm active:scale-95 transition-all text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-1.5 group-hover:bg-amber-100 transition-colors">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 group-hover:text-amber-700 leading-tight">
                Mutasi
              </span>
            </button>

            <button
              onClick={() => onNavigate('laporan')}
              className="flex flex-col items-center p-2.5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-sm active:scale-95 transition-all text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-1.5 group-hover:bg-indigo-100 transition-colors">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 group-hover:text-indigo-700 leading-tight">
                Laporan
              </span>
            </button>

            <button
              onClick={() => onNavigate('pengaturan')}
              className="flex flex-col items-center p-2.5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-400 hover:shadow-sm active:scale-95 transition-all text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-1.5 group-hover:bg-slate-200 transition-colors">
                <Settings className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 group-hover:text-slate-900 leading-tight">
                Pengaturan
              </span>
            </button>
          </div>
        </div>

        {/* Quick Action Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-3.5 border border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Catat Setoran Cepat</h3>
              <p className="text-[11px] text-slate-500">Pilih siswa & masukkan nominal tabungan</p>
            </div>
          </div>
          <button
            onClick={() => onOpenTambahTransaksi(undefined, 'SETORAN')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs active:scale-95 transition-all"
          >
            + Setor
          </button>
        </div>

        {/* Transaksi Terbaru */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Transaksi Terbaru
            </h2>
            <button
              onClick={() => onOpenMutasi()}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-0.5"
            >
              Lihat Semua
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentTx.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-slate-200">
              <p className="text-xs text-slate-400 font-medium">Belum ada transaksi.</p>
              <button
                onClick={() => onOpenTambahTransaksi()}
                className="mt-3 text-xs font-semibold text-blue-700 hover:underline"
              >
                + Tambah Transaksi Pertama
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
              {recentTx.map((tx) => {
                const siswaInfo = siswaMap.get(tx.siswaId);
                const isSetor = tx.jenisTransaksi === 'SETORAN';

                return (
                  <div
                    key={tx.id}
                    onClick={() => onOpenDetailSiswa(tx.siswaId)}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer active:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSetor
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}
                      >
                        {isSetor ? (
                          <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {siswaInfo?.nama || 'Siswa'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {formatTanggalIndo(tx.tanggal)} · {tx.keterangan || (isSetor ? 'Setoran' : 'Penarikan')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <span
                        className={`text-xs font-bold font-mono ${
                          isSetor ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isSetor ? '+' : '-'} {formatRupiah(tx.nominal)}
                      </span>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {siswaInfo?.kelas ? `Kelas ${siswaInfo.kelas}` : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

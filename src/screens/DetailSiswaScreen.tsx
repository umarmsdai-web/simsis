import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Minus,
  Clock,
  Send,
  Phone,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Sparkles,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { db, subscribeToDatabase } from '../services/storage';
import { formatRupiah, formatTanggalIndo } from '../utils/formatters';
import { WhatsAppModal } from '../components/WhatsAppModal';
import { buildTransaksiWhatsAppText } from '../utils/whatsapp';
import type { Siswa, Transaksi, MutasiRow } from '../types';

interface DetailSiswaScreenProps {
  siswaId: string;
  onBack: () => void;
  onOpenTambahTransaksi: (siswaId: string, defaultJenis?: 'SETORAN' | 'PENARIKAN') => void;
  onOpenMutasi: (siswaId: string) => void;
}

export const DetailSiswaScreen: React.FC<DetailSiswaScreenProps> = ({
  siswaId,
  onBack,
  onOpenTambahTransaksi,
  onOpenMutasi,
}) => {
  const [siswa, setSiswa] = useState<Siswa | undefined>(undefined);
  const [kelasNama, setKelasNama] = useState('');
  const [saldo, setSaldo] = useState(0);
  const [mutasiRows, setMutasiRows] = useState<MutasiRow[]>([]);
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [waMessageText, setWaMessageText] = useState('');

  const loadData = () => {
    const s = db.getSiswaById(siswaId);
    setSiswa(s);
    if (s) {
      const k = db.getKelasById(s.kelasId);
      setKelasNama(k?.namaKelas || '-');
      const b = db.calculateBalance(s.id);
      setSaldo(b);
      const rows = db.getMutasiForSiswa(s.id, 'all');
      setMutasiRows(rows);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDatabase(loadData);
    return () => unsubscribe();
  }, [siswaId]);

  if (!siswa) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
        <p className="text-sm font-bold text-slate-700">Data siswa tidak ditemukan.</p>
        <button
          onClick={onBack}
          className="mt-3 px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-semibold"
        >
          Kembali
        </button>
      </div>
    );
  }

  const handleShareSummaryWhatsApp = () => {
    let text = `*SIMSIS - SIMPANAN SISWA*\n\n`;
    text += `Nama: ${siswa.namaSiswa}\n`;
    text += `NIS: ${siswa.nis || '-'}\n`;
    text += `Kelas: ${kelasNama}\n`;
    text += `Tanggal: ${formatTanggalIndo(new Date().toISOString().split('T')[0])}\n\n`;
    text += `*SALDO SAAT INI: ${formatRupiah(saldo)}*\n\n`;
    text += `Total Transaksi: ${mutasiRows.length} kali\n`;
    text += `Status: Aktif\n\n`;
    text += `Terima kasih.\n_SimSis - MSD Temanggung by Umar_`;

    setWaMessageText(text);
    setIsWaModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 pb-28">
      {/* Top Header */}
      <div className="bg-blue-700 text-white p-4 sticky top-0 z-20 shadow-xs flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-blue-100 hover:text-white font-medium text-xs py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
        <span className="text-xs font-bold text-white uppercase tracking-wider">
          Detail Siswa
        </span>
        <div className="w-12"></div>
      </div>

      <div className="p-4 space-y-4">
        {/* Siswa Card & Big Balance (Section 8) */}
        <div className="bg-gradient-to-br from-blue-800 to-indigo-900 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold bg-white/15 px-2.5 py-0.5 rounded-full text-blue-100">
                Kelas {kelasNama}
              </span>
              <h2 className="text-lg font-extrabold text-white mt-2 leading-tight">
                {siswa.namaSiswa}
              </h2>
              <p className="text-xs text-blue-200 font-mono mt-0.5">
                NIS: {siswa.nis || '-'} · {siswa.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}
              </p>
            </div>

            {siswa.nomorWhatsApp && (
              <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2 py-1 rounded-xl text-[10px] font-mono">
                <Phone className="w-3 h-3 text-emerald-300" />
                <span>{siswa.nomorWhatsApp}</span>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-white/15">
            <p className="text-xs text-blue-200 font-medium">Saldo Simpanan Siswa</p>
            <div className="text-3xl font-black font-mono tracking-tight text-white mt-1">
              {formatRupiah(saldo)}
            </div>
          </div>
        </div>

        {/* 4 Action Buttons: + Setoran, - Penarikan, Mutasi, Kirim WhatsApp */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => onOpenTambahTransaksi(siswa.id, 'SETORAN')}
            className="flex items-center justify-center gap-2 py-3 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Setoran</span>
          </button>

          <button
            onClick={() => onOpenTambahTransaksi(siswa.id, 'PENARIKAN')}
            className="flex items-center justify-center gap-2 py-3 px-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-sm transition-all"
          >
            <Minus className="w-4 h-4 stroke-[3]" />
            <span>- Penarikan</span>
          </button>

          <button
            onClick={() => onOpenMutasi(siswa.id)}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white hover:bg-slate-100 active:scale-95 text-slate-700 border border-slate-200 font-semibold text-xs rounded-2xl shadow-xs transition-all"
          >
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Mutasi Tabungan</span>
          </button>

          <button
            onClick={handleShareSummaryWhatsApp}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-700 border border-emerald-200 font-semibold text-xs rounded-2xl shadow-xs transition-all"
          >
            <Send className="w-4 h-4 text-emerald-600" />
            <span>Kirim WhatsApp</span>
          </button>
        </div>

        {/* Riwayat Transaksi Terbaru Siswa (Section 8) */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Transaksi Terkini
            </h3>
            <button
              onClick={() => onOpenMutasi(siswa.id)}
              className="text-xs font-semibold text-blue-700 hover:underline"
            >
              Lihat Seluruh Mutasi
            </button>
          </div>

          {mutasiRows.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-slate-200">
              <p className="text-xs text-slate-400">Belum ada transaksi untuk siswa ini.</p>
              <button
                onClick={() => onOpenTambahTransaksi(siswa.id, 'SETORAN')}
                className="mt-2 text-xs font-semibold text-emerald-600 hover:underline"
              >
                + Buat Setoran Pertama
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
              {mutasiRows.slice(0, 5).map((row) => {
                const isSetor = row.jenisTransaksi === 'SETORAN';

                return (
                  <div key={row.id} className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isSetor
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {isSetor ? (
                          <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {isSetor ? 'Setoran' : 'Penarikan'} · {formatTanggalIndo(row.tanggal)}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {row.keterangan}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-xs font-bold font-mono ${
                          isSetor ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isSetor ? '+' : '-'} {formatRupiah(isSetor ? row.masuk : row.keluar)}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Saldo {formatRupiah(row.saldoBerjalan)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp Modal */}
      <WhatsAppModal
        isOpen={isWaModalOpen}
        onClose={() => setIsWaModalOpen(false)}
        phone={siswa.nomorWhatsApp}
        recipientName={siswa.namaSiswa}
        messageText={waMessageText}
        title="Kirim Info Tabungan Siswa"
      />
    </div>
  );
};

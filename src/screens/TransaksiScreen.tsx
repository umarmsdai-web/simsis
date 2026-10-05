import React, { useState, useEffect } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Check,
  AlertCircle,
  Search,
  User,
  Send,
  Info,
} from 'lucide-react';
import { db, subscribeToDatabase } from '../services/storage';
import {
  formatRupiah,
  parseRupiahInput,
  getTodayDateString,
  formatTanggalIndo,
} from '../utils/formatters';
import { WhatsAppModal } from '../components/WhatsAppModal';
import { buildTransaksiWhatsAppText } from '../utils/whatsapp';
import type { SiswaWithBalance, JenisTransaksi, Transaksi } from '../types';

interface TransaksiScreenProps {
  initialSiswaId?: string;
  initialJenis?: JenisTransaksi;
  onSuccessNavigate?: () => void;
  onNavigateToSiswa?: () => void;
}

export const TransaksiScreen: React.FC<TransaksiScreenProps> = ({
  initialSiswaId,
  initialJenis = 'SETORAN',
  onSuccessNavigate,
  onNavigateToSiswa,
}) => {
  const [siswaList, setSiswaList] = useState<SiswaWithBalance[]>([]);
  const [selectedSiswaId, setSelectedSiswaId] = useState(initialSiswaId || '');
  const [jenisTransaksi, setJenisTransaksi] = useState<JenisTransaksi>(initialJenis);
  const [nominalDisplay, setNominalDisplay] = useState('');
  const [tanggal, setTanggal] = useState(getTodayDateString());
  const [keterangan, setKeterangan] = useState('');

  // Search filter for dropdown
  const [siswaSearch, setSiswaSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Status & Validation
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // WhatsApp post-save prompt
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [savedTxData, setSavedTxData] = useState<{
    siswa: SiswaWithBalance;
    tx: Transaksi;
    newBalance: number;
  } | null>(null);

  const loadSiswa = () => {
    const list = db.getSiswaWithBalances('ALL');
    setSiswaList(list);
    if (!selectedSiswaId && list.length > 0 && !initialSiswaId) {
      setSelectedSiswaId(list[0].id);
    }
  };

  useEffect(() => {
    loadSiswa();
    const unsubscribe = subscribeToDatabase(loadSiswa);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (initialSiswaId) {
      setSelectedSiswaId(initialSiswaId);
    }
    if (initialJenis) {
      setJenisTransaksi(initialJenis);
    }
  }, [initialSiswaId, initialJenis]);

  const selectedSiswa = siswaList.find((s) => s.id === selectedSiswaId);

  // Handle nominal input with live formatting
  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const numeric = parseRupiahInput(raw);
    if (numeric === 0 && raw === '') {
      setNominalDisplay('');
    } else {
      setNominalDisplay(new Intl.NumberFormat('id-ID').format(numeric));
    }
    setErrorMsg('');
  };

  const handleQuickNominal = (amount: number) => {
    setNominalDisplay(new Intl.NumberFormat('id-ID').format(amount));
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedSiswaId) {
      setErrorMsg('Pilih siswa terlebih dahulu.');
      return;
    }

    const nominalNumber = parseRupiahInput(nominalDisplay);
    if (nominalNumber <= 0) {
      setErrorMsg('Nominal harus lebih besar dari Rp0.');
      return;
    }

    if (!selectedSiswa) {
      setErrorMsg('Data siswa tidak ditemukan.');
      return;
    }

    // Validation: cannot withdraw more than current balance
    if (jenisTransaksi === 'PENARIKAN' && nominalNumber > selectedSiswa.saldo) {
      setErrorMsg('Saldo tidak mencukupi.');
      return;
    }

    const newTx: Transaksi = {
      id: `t-${Date.now()}`,
      siswaId: selectedSiswaId,
      tanggal,
      jenisTransaksi,
      nominal: nominalNumber,
      keterangan: keterangan.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const res = db.saveTransaksi(newTx);
    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    // Calculate new balance
    const updatedBalance = db.calculateBalance(selectedSiswaId);

    setSavedTxData({
      siswa: selectedSiswa,
      tx: newTx,
      newBalance: updatedBalance,
    });

    setSuccessToast('Transaksi berhasil disimpan.');
    // Open WhatsApp prompt as required by Section 10
    setWaModalOpen(true);

    // Reset inputs
    setNominalDisplay('');
    setKeterangan('');
  };

  const filteredSiswa = siswaList.filter((s) =>
    s.namaSiswa.toLowerCase().includes(siswaSearch.toLowerCase()) ||
    s.nis.toLowerCase().includes(siswaSearch.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-50 pb-28">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Screen Title */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-20 shadow-xs">
        <h2 className="text-sm font-bold text-slate-800">Tambah Transaksi</h2>
        <p className="text-[11px] text-slate-400">
          Catat setoran atau penarikan simpanan siswa
        </p>
      </div>

      <div className="p-4 max-w-lg mx-auto w-full">
        {siswaList.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center mt-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Belum Ada Data Siswa</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Silakan tambahkan data siswa terlebih dahulu sebelum mencatat setoran atau penarikan.
            </p>
            {onNavigateToSiswa && (
              <button
                type="button"
                onClick={onNavigateToSiswa}
                className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-xs inline-flex items-center gap-1.5"
              >
                <span>+ Tambah Siswa Sekarang</span>
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-semibold">{errorMsg}</span>
              </div>
            )}

            {/* 1. Siswa Selector */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Siswa <span className="text-rose-500">*</span>
              </label>

            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-left flex items-center justify-between text-xs hover:bg-slate-100 transition-colors"
            >
              {selectedSiswa ? (
                <div>
                  <span className="font-bold text-slate-800">{selectedSiswa.namaSiswa}</span>
                  <span className="text-slate-400 ml-2">
                    (Kelas {selectedSiswa.kelasNama} · Saldo: {formatRupiah(selectedSiswa.saldo)})
                  </span>
                </div>
              ) : (
                <span className="text-slate-400">Pilih salah satu siswa...</span>
              )}
              <User className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
            </button>

            {/* Dropdown Menu with Search */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-hidden flex flex-col animate-in fade-in">
                <div className="p-2 border-b border-slate-100 bg-slate-50">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={siswaSearch}
                      onChange={(e) => setSiswaSearch(e.target.value)}
                      placeholder="Ketik nama atau NIS..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
                  {filteredSiswa.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400">
                      Siswa tidak ditemukan
                    </div>
                  ) : (
                    filteredSiswa.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedSiswaId(s.id);
                          setIsDropdownOpen(false);
                          setSiswaSearch('');
                        }}
                        className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between hover:bg-blue-50 transition-colors ${
                          selectedSiswaId === s.id ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{s.namaSiswa}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            NIS: {s.nis} · Kelas {s.kelasNama}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-blue-700 font-bold">
                            {formatRupiah(s.saldo)}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Current Balance Indicator */}
          {selectedSiswa && (
            <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3 flex items-center justify-between">
              <span className="text-xs text-slate-600">Saldo saat ini:</span>
              <span className="text-sm font-bold font-mono text-blue-800">
                {formatRupiah(selectedSiswa.saldo)}
              </span>
            </div>
          )}

          {/* 2. Jenis Transaksi (Setoran / Penarikan) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Jenis Transaksi <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setJenisTransaksi('SETORAN');
                  setErrorMsg('');
                }}
                className={`py-3 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  jenisTransaksi === 'SETORAN'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 stroke-[3]" />
                <span>SETORAN (+)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setJenisTransaksi('PENARIKAN');
                  setErrorMsg('');
                }}
                className={`py-3 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  jenisTransaksi === 'PENARIKAN'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                <span>PENARIKAN (-)</span>
              </button>
            </div>
          </div>

          {/* 3. Nominal Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Nominal (Rp) <span className="text-rose-500">*</span>
              </label>
              {nominalDisplay && (
                <span className="text-[11px] font-mono text-blue-700 font-bold">
                  {formatRupiah(parseRupiahInput(nominalDisplay))}
                </span>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={nominalDisplay}
                onChange={handleNominalChange}
                placeholder="20.000"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-base font-bold font-mono text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            {/* Quick chips */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5">
              {[10000, 20000, 50000, 100000, 200000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickNominal(amt)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-mono font-medium whitespace-nowrap active:scale-95 transition-all"
                >
                  +{new Intl.NumberFormat('id-ID').format(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Tanggal Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tanggal Transaksi
            </label>
            <div className="relative">
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>
          </div>

          {/* 5. Keterangan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Keterangan <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Tabungan mingguan, Beli LKS, dll."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-700/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>Simpan Transaksi</span>
            </button>
          </div>
        </form>
        )}
      </div>

      {/* WhatsApp Modal Trigger after save (Section 10) */}
      {savedTxData && (
        <WhatsAppModal
          isOpen={waModalOpen}
          onClose={() => {
            setWaModalOpen(false);
            if (onSuccessNavigate) onSuccessNavigate();
          }}
          phone={savedTxData.siswa.nomorWhatsApp}
          recipientName={savedTxData.siswa.namaSiswa}
          messageText={buildTransaksiWhatsAppText(
            savedTxData.siswa,
            savedTxData.siswa.kelasNama,
            savedTxData.tx,
            savedTxData.newBalance
          )}
          title="Kirim Bukti Transaksi via WhatsApp?"
        />
      )}
    </div>
  );
};

import type {
  Kelas,
  Siswa,
  Transaksi,
  PengaturanSekolah,
  SiswaWithBalance,
  MutasiRow,
  RekapLaporan,
} from '../types';
import { getTodayDateString } from '../utils/formatters';

const STORAGE_KEYS = {
  KELAS: 'simsis_kelas_v2',
  SISWA: 'simsis_siswa_v2',
  TRANSAKSI: 'simsis_transaksi_v2',
  PENGATURAN: 'simsis_pengaturan_v2',
};

const DEFAULT_PENGATURAN: PengaturanSekolah = {
  namaSekolah: '',
  alamat: '',
  namaWaliKelas: '',
  tahunAjaran: '2026/2027',
  formatMataUang: 'IDR',
};

const INITIAL_KELAS: Kelas[] = [];
const INITIAL_SISWA: Siswa[] = [];
const INITIAL_TRANSAKSI: Transaksi[] = [];

type StorageListener = () => void;
const listeners = new Set<StorageListener>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Listener notification error:', e);
    }
  });
}

export function subscribeToDatabase(listener: StorageListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

class LocalDatabaseService {
  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (typeof window === 'undefined') return;

    // Bersihkan key v1 dummy lama agar instalasi benar-benar kosong
    localStorage.removeItem('simsis_kelas_v1');
    localStorage.removeItem('simsis_siswa_v1');
    localStorage.removeItem('simsis_transaksi_v1');
    localStorage.removeItem('simsis_pengaturan_v1');

    if (!localStorage.getItem(STORAGE_KEYS.KELAS)) {
      localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(INITIAL_KELAS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SISWA)) {
      localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(INITIAL_SISWA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSAKSI)) {
      localStorage.setItem(STORAGE_KEYS.TRANSAKSI, JSON.stringify(INITIAL_TRANSAKSI));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PENGATURAN)) {
      localStorage.setItem(STORAGE_KEYS.PENGATURAN, JSON.stringify(DEFAULT_PENGATURAN));
    }
  }

  // --- KELAS DAO ---
  getKelasList(): Kelas[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KELAS);
      return data ? JSON.parse(data) : INITIAL_KELAS;
    } catch {
      return INITIAL_KELAS;
    }
  }

  getKelasById(id: string): Kelas | undefined {
    return this.getKelasList().find((k) => k.id === id);
  }

  saveKelas(kelas: Kelas): void {
    const list = this.getKelasList();
    const index = list.findIndex((k) => k.id === kelas.id);
    if (index >= 0) {
      list[index] = kelas;
    } else {
      list.push(kelas);
    }
    localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(list));
    notifyListeners();
  }

  deleteKelas(id: string): boolean {
    const list = this.getKelasList().filter((k) => k.id !== id);
    localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(list));
    notifyListeners();
    return true;
  }

  // --- SISWA DAO ---
  getSiswaList(onlyActive = true): Siswa[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SISWA);
      const list: Siswa[] = data ? JSON.parse(data) : INITIAL_SISWA;
      return onlyActive ? list.filter((s) => s.statusAktif !== false) : list;
    } catch {
      return INITIAL_SISWA;
    }
  }

  getSiswaById(id: string): Siswa | undefined {
    return this.getSiswaList(false).find((s) => s.id === id);
  }

  saveSiswa(siswa: Siswa): void {
    const list = this.getSiswaList(false);
    const index = list.findIndex((s) => s.id === siswa.id);
    if (index >= 0) {
      list[index] = siswa;
    } else {
      list.push(siswa);
    }
    localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(list));
    notifyListeners();
  }

  deleteSiswa(id: string, softDelete = true): void {
    const list = this.getSiswaList(false);
    if (softDelete) {
      const target = list.find((s) => s.id === id);
      if (target) {
        target.statusAktif = false;
        localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(list));
      }
    } else {
      const updated = list.filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(updated));
    }
    notifyListeners();
  }

  // --- TRANSAKSI DAO ---
  getTransaksiList(): Transaksi[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSAKSI);
      return data ? JSON.parse(data) : INITIAL_TRANSAKSI;
    } catch {
      return INITIAL_TRANSAKSI;
    }
  }

  getTransaksiBySiswa(siswaId: string): Transaksi[] {
    return this.getTransaksiList()
      .filter((t) => t.siswaId === siswaId)
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime() || b.id.localeCompare(a.id));
  }

  saveTransaksi(transaksi: Transaksi): { success: boolean; message: string } {
    if (transaksi.nominal <= 0) {
      return { success: false, message: 'Nominal harus lebih besar dari Rp0.' };
    }

    if (transaksi.jenisTransaksi === 'PENARIKAN') {
      const currentBalance = this.calculateBalance(transaksi.siswaId);
      if (transaksi.nominal > currentBalance) {
        return { success: false, message: 'Saldo tidak mencukupi.' };
      }
    }

    const list = this.getTransaksiList();
    list.unshift(transaksi);
    localStorage.setItem(STORAGE_KEYS.TRANSAKSI, JSON.stringify(list));
    notifyListeners();
    return { success: true, message: 'Transaksi berhasil disimpan.' };
  }

  deleteTransaksi(id: string): boolean {
    const list = this.getTransaksiList().filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRANSAKSI, JSON.stringify(list));
    notifyListeners();
    return true;
  }

  // --- BUSINESS LOGIC: SALDO & METRICS ---
  calculateBalance(siswaId: string): number {
    const studentTx = this.getTransaksiList().filter((t) => t.siswaId === siswaId);
    let totalSetoran = 0;
    let totalPenarikan = 0;
    for (const t of studentTx) {
      if (t.jenisTransaksi === 'SETORAN') {
        totalSetoran += t.nominal;
      } else if (t.jenisTransaksi === 'PENARIKAN') {
        totalPenarikan += t.nominal;
      }
    }
    return Math.max(0, totalSetoran - totalPenarikan);
  }

  getSiswaWithBalances(kelasFilter?: string, searchQuery?: string): SiswaWithBalance[] {
    const siswaList = this.getSiswaList(true);
    const kelasList = this.getKelasList();
    const kelasMap = new Map<string, string>();
    kelasList.forEach((k) => kelasMap.set(k.id, k.namaKelas));

    const allTx = this.getTransaksiList();

    let filtered = siswaList;
    if (kelasFilter && kelasFilter !== 'ALL') {
      filtered = filtered.filter((s) => s.kelasId === kelasFilter);
    }
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (s) => s.namaSiswa.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q)
      );
    }

    return filtered.map((siswa) => {
      const txs = allTx.filter((t) => t.siswaId === siswa.id);
      let totalSetoran = 0;
      let totalPenarikan = 0;
      txs.forEach((t) => {
        if (t.jenisTransaksi === 'SETORAN') totalSetoran += t.nominal;
        else if (t.jenisTransaksi === 'PENARIKAN') totalPenarikan += t.nominal;
      });
      const saldo = Math.max(0, totalSetoran - totalPenarikan);

      return {
        ...siswa,
        kelasNama: kelasMap.get(siswa.kelasId) || 'Kelas ?',
        totalSetoran,
        totalPenarikan,
        saldo,
        jumlahTransaksi: txs.length,
      };
    });
  }

  getDashboardMetrics() {
    const activeStudents = this.getSiswaList(true);
    const allTx = this.getTransaksiList();
    const today = getTodayDateString();

    let totalSetoranAll = 0;
    let totalPenarikanAll = 0;
    let setoranHariIni = 0;
    let penarikanHariIni = 0;

    // Hitung hanya untuk siswa yang aktif
    const activeStudentIds = new Set(activeStudents.map((s) => s.id));

    allTx.forEach((tx) => {
      if (!activeStudentIds.has(tx.siswaId)) return;

      if (tx.jenisTransaksi === 'SETORAN') {
        totalSetoranAll += tx.nominal;
        if (tx.tanggal === today) {
          setoranHariIni += tx.nominal;
        }
      } else if (tx.jenisTransaksi === 'PENARIKAN') {
        totalPenarikanAll += tx.nominal;
        if (tx.tanggal === today) {
          penarikanHariIni += tx.nominal;
        }
      }
    });

    const totalSaldo = Math.max(0, totalSetoranAll - totalPenarikanAll);

    return {
      jumlahSiswa: activeStudents.length,
      totalSaldo,
      setoranHariIni,
      penarikanHariIni,
    };
  }

  getMutasiForSiswa(
    siswaId: string,
    filterPeriod: 'all' | 'today' | 'week' | 'month' | 'custom' = 'all',
    startDate?: string,
    endDate?: string
  ): MutasiRow[] {
    const rawTx = this.getTransaksiList().filter((t) => t.siswaId === siswaId);
    // Sort chronological first to compute accurate running balance
    const chronoTx = [...rawTx].sort(
      (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime() || a.id.localeCompare(b.id)
    );

    let running = 0;
    const withRunning: MutasiRow[] = chronoTx.map((tx) => {
      const isSetor = tx.jenisTransaksi === 'SETORAN';
      const masuk = isSetor ? tx.nominal : 0;
      const keluar = isSetor ? 0 : tx.nominal;
      running += masuk - keluar;
      if (running < 0) running = 0;

      return {
        id: tx.id,
        tanggal: tx.tanggal,
        keterangan: tx.keterangan || (isSetor ? 'Setoran Tabungan' : 'Penarikan Tabungan'),
        jenisTransaksi: tx.jenisTransaksi,
        masuk,
        keluar,
        saldoBerjalan: running,
      };
    });

    // Now apply period filter
    const now = new Date();
    const todayStr = getTodayDateString();

    let filtered = withRunning;
    if (filterPeriod === 'today') {
      filtered = filtered.filter((r) => r.tanggal === todayStr);
    } else if (filterPeriod === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      const weekStr = oneWeekAgo.toISOString().split('T')[0];
      filtered = filtered.filter((r) => r.tanggal >= weekStr);
    } else if (filterPeriod === 'month') {
      const firstDayMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      filtered = filtered.filter((r) => r.tanggal >= firstDayMonth);
    } else if (filterPeriod === 'custom' && startDate && endDate) {
      filtered = filtered.filter((r) => r.tanggal >= startDate && r.tanggal <= endDate);
    }

    // Return sorted newest first as requested in Section 12
    return filtered.reverse();
  }

  getRekapLaporan(
    kelasId = 'ALL',
    siswaId = 'ALL',
    filterPeriod = 'all',
    startDate?: string,
    endDate?: string
  ): {
    rows: RekapLaporan[];
    totalSetoran: number;
    totalPenarikan: number;
    totalSaldo: number;
  } {
    const allStudents = this.getSiswaList(true);
    const kelasList = this.getKelasList();
    const kelasMap = new Map<string, string>();
    kelasList.forEach((k) => kelasMap.set(k.id, k.namaKelas));

    let students = allStudents;
    if (kelasId !== 'ALL') {
      students = students.filter((s) => s.kelasId === kelasId);
    }
    if (siswaId !== 'ALL') {
      students = students.filter((s) => s.id === siswaId);
    }

    const allTx = this.getTransaksiList();
    const now = new Date();
    const todayStr = getTodayDateString();

    let txFiltered = allTx;
    if (filterPeriod === 'today') {
      txFiltered = txFiltered.filter((t) => t.tanggal === todayStr);
    } else if (filterPeriod === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      const weekStr = oneWeekAgo.toISOString().split('T')[0];
      txFiltered = txFiltered.filter((t) => t.tanggal >= weekStr);
    } else if (filterPeriod === 'month') {
      const firstDayMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      txFiltered = txFiltered.filter((t) => t.tanggal >= firstDayMonth);
    } else if (filterPeriod === 'custom' && startDate && endDate) {
      txFiltered = txFiltered.filter((t) => t.tanggal >= startDate && t.tanggal <= endDate);
    }

    let overallSetoran = 0;
    let overallPenarikan = 0;

    const rows: RekapLaporan[] = students.map((s) => {
      const studentTx = txFiltered.filter((t) => t.siswaId === s.id);
      let sSetoran = 0;
      let sPenarikan = 0;
      studentTx.forEach((t) => {
        if (t.jenisTransaksi === 'SETORAN') sSetoran += t.nominal;
        else if (t.jenisTransaksi === 'PENARIKAN') sPenarikan += t.nominal;
      });

      // Saldo akumulatif keseluruhan siswa
      const saldo = this.calculateBalance(s.id);

      overallSetoran += sSetoran;
      overallPenarikan += sPenarikan;

      return {
        siswaId: s.id,
        nis: s.nis,
        namaSiswa: s.namaSiswa,
        kelasNama: kelasMap.get(s.kelasId) || '-',
        totalSetoran: sSetoran,
        totalPenarikan: sPenarikan,
        saldo,
      };
    });

    const totalSaldo = rows.reduce((acc, r) => acc + r.saldo, 0);

    return {
      rows,
      totalSetoran: overallSetoran,
      totalPenarikan: overallPenarikan,
      totalSaldo,
    };
  }

  // --- PENGATURAN ---
  getPengaturan(): PengaturanSekolah {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PENGATURAN);
      return data ? JSON.parse(data) : DEFAULT_PENGATURAN;
    } catch {
      return DEFAULT_PENGATURAN;
    }
  }

  savePengaturan(pengaturan: PengaturanSekolah): void {
    localStorage.setItem(STORAGE_KEYS.PENGATURAN, JSON.stringify(pengaturan));
    notifyListeners();
  }

  // --- BACKUP & RESTORE (Section 18 & 19) ---
  exportBackupJsonString(): string {
    const backupObj = {
      app: 'SimSis',
      subTitle: 'Simpanan Siswa',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      creator: 'MSD Temanggung by Umar',
      kelas: this.getKelasList(),
      siswa: this.getSiswaList(false),
      transaksi: this.getTransaksiList(),
      pengaturan: this.getPengaturan(),
    };
    return JSON.stringify(backupObj, null, 2);
  }

  restoreBackupJsonString(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !Array.isArray(parsed.siswa) || !Array.isArray(parsed.transaksi)) {
        return { success: false, message: 'File backup tidak valid.' };
      }

      if (Array.isArray(parsed.kelas)) {
        localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(parsed.kelas));
      }
      localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(parsed.siswa));
      localStorage.setItem(STORAGE_KEYS.TRANSAKSI, JSON.stringify(parsed.transaksi));
      if (parsed.pengaturan) {
        localStorage.setItem(STORAGE_KEYS.PENGATURAN, JSON.stringify(parsed.pengaturan));
      }

      notifyListeners();
      return { success: true, message: 'Data berhasil dipulihkan.' };
    } catch {
      return { success: false, message: 'File backup tidak valid.' };
    }
  }

  resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.KELAS);
    localStorage.removeItem(STORAGE_KEYS.SISWA);
    localStorage.removeItem(STORAGE_KEYS.TRANSAKSI);
    localStorage.removeItem(STORAGE_KEYS.PENGATURAN);
    this.ensureInitialized();
    notifyListeners();
  }
}

export const db = new LocalDatabaseService();

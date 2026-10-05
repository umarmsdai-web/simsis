export type JenisKelamin = 'L' | 'P';
export type JenisTransaksi = 'SETORAN' | 'PENARIKAN';

export interface Kelas {
  id: string;
  namaKelas: string;
  namaWaliKelas: string;
  tahunAjaran: string;
  createdAt: string;
}

export interface Siswa {
  id: string;
  kelasId: string;
  nis: string;
  namaSiswa: string;
  jenisKelamin: JenisKelamin;
  nomorWhatsApp?: string;
  statusAktif: boolean;
  createdAt: string;
}

export interface Transaksi {
  id: string;
  siswaId: string;
  tanggal: string; // YYYY-MM-DD
  jenisTransaksi: JenisTransaksi;
  nominal: number; // Integer in IDR
  keterangan?: string;
  createdAt: string;
}

export interface PengaturanSekolah {
  namaSekolah: string;
  alamat: string;
  namaWaliKelas: string;
  tahunAjaran: string;
  formatMataUang: string;
}

export interface SiswaWithBalance extends Siswa {
  kelasNama: string;
  totalSetoran: number;
  totalPenarikan: number;
  saldo: number;
  jumlahTransaksi: number;
}

export interface MutasiRow {
  id: string;
  tanggal: string;
  keterangan: string;
  jenisTransaksi: JenisTransaksi;
  masuk: number;
  keluar: number;
  saldoBerjalan: number;
}

export interface RekapLaporan {
  siswaId: string;
  nis: string;
  namaSiswa: string;
  kelasNama: string;
  totalSetoran: number;
  totalPenarikan: number;
  saldo: number;
}

export type ActiveTab = 'dashboard' | 'siswa' | 'transaksi' | 'laporan' | 'pengaturan' | 'about';

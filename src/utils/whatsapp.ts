import { formatRupiah, formatTanggalIndo, formatWhatsAppNumber } from './formatters';
import type { Siswa, Transaksi, RekapLaporan } from '../types';

export const MSD_WHATSAPP_NUMBER = '6282138950006';

/**
 * Buat teks pesan WhatsApp untuk bukti transaksi
 */
export function buildTransaksiWhatsAppText(
  siswa: Siswa,
  kelasNama: string,
  transaksi: Transaksi,
  saldoSaatIni: number
): string {
  const tanggalIndo = formatTanggalIndo(transaksi.tanggal);
  const nominalFormatted = formatRupiah(transaksi.nominal);
  const saldoFormatted = formatRupiah(saldoSaatIni);
  const jenisText = transaksi.jenisTransaksi === 'SETORAN' ? 'SETORAN' : 'PENARIKAN';

  let text = `*SIMSIS - SIMPANAN SISWA*\n\n`;
  text += `Nama: ${siswa.namaSiswa}\n`;
  text += `Kelas: ${kelasNama || '-'}\n`;
  text += `Tanggal: ${tanggalIndo}\n\n`;
  text += `Transaksi: ${jenisText}\n`;
  text += `Nominal: ${nominalFormatted}\n`;
  if (transaksi.keterangan && transaksi.keterangan.trim()) {
    text += `Keterangan: ${transaksi.keterangan.trim()}\n`;
  }
  text += `\nSaldo saat ini: ${saldoFormatted}\n\n`;
  text += `Terima kasih.`;

  return text;
}

/**
 * Buat teks pesan WhatsApp untuk laporan rekap simpanan
 */
export function buildLaporanWhatsAppText(
  namaKelas: string,
  periodeStr: string,
  rekapList: RekapLaporan[],
  totalSaldo: number
): string {
  let text = `*LAPORAN SIMPANAN SISWA*\n\n`;
  text += `Kelas: ${namaKelas || 'Semua Kelas'}\n`;
  text += `Periode: ${periodeStr}\n\n`;

  rekapList.forEach((item, index) => {
    text += `${index + 1}. ${item.namaSiswa}\n`;
    text += `   Setoran: ${formatRupiah(item.totalSetoran)}\n`;
    text += `   Penarikan: ${formatRupiah(item.totalPenarikan)}\n`;
    text += `   Saldo: ${formatRupiah(item.saldo)}\n\n`;
  });

  text += `---\n\n`;
  text += `*TOTAL SALDO: ${formatRupiah(totalSaldo)}*\n\n`;
  text += `Laporan dibuat menggunakan aplikasi SimSis.\n`;
  text += `Dibuat oleh: MSD Temanggung by Umar`;

  return text;
}

/**
 * Buat tautan deep-link WhatsApp
 */
export function getWhatsAppUrl(phone?: string, text?: string): string {
  const formattedPhone = formatWhatsAppNumber(phone);
  const encodedText = encodeURIComponent(text || '');

  if (formattedPhone) {
    return `https://wa.me/${formattedPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

/**
 * Hubungi kontak pembuat MSD Temanggung by Umar
 */
export function getMsdWhatsAppUrl(): string {
  const msg = 'Halo MSD Temanggung by Umar, saya ingin mendapatkan informasi tentang aplikasi SimSis.';
  return `https://wa.me/${MSD_WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

/**
 * Format angka ke mata uang Rupiah Indonesia
 * Contoh: 150000 -> "Rp150.000"
 */
export function formatRupiah(nominal: number): string {
  if (isNaN(nominal)) return 'Rp0';
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(nominal);
  // standard id-ID format is "Rp 150.000" or "Rp150.000"
  return formatted.replace(/\s+/g, '');
}

/**
 * Parsing input string angka dengan pemisah titik menjadi number integer murni
 */
export function parseRupiahInput(input: string): number {
  const clean = input.replace(/[^0-9]/g, '');
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format tanggal YYYY-MM-DD ke format Indonesia panjang
 * Contoh: "2026-10-05" -> "05 Oktober 2026"
 */
export function formatTanggalIndo(dateString: string): string {
  if (!dateString) return '-';
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format tanggal ringkas DD/MM/YYYY
 * Contoh: "2026-10-05" -> "05/10/2026"
 */
export function formatTanggalRingkas(dateString: string): string {
  if (!dateString) return '-';
  try {
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return dateString;
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

/**
 * Format nomor WhatsApp ke format internasional 62
 * Contoh: "082138950006" -> "6282138950006"
 */
export function formatWhatsAppNumber(phone?: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62') && cleaned.length > 5) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

/**
 * Dapatkan string tanggal hari ini YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

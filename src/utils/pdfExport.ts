import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatRupiah } from './formatters';
import type { PengaturanSekolah, RekapLaporan } from '../types';

interface GeneratePdfOptions {
  sekolah: PengaturanSekolah;
  namaKelas: string;
  waliKelas: string;
  tahunAjaran: string;
  periode: string;
  data: RekapLaporan[];
  totalSetoran: number;
  totalPenarikan: number;
  totalSaldo: number;
}

export function generateLaporanPdf(options: GeneratePdfOptions): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Background bar
  doc.setFillColor(30, 64, 175); // Royal Blue #1e40af
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SimSis (Simpanan Siswa)', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Laporan Rekapitulasi Tabungan Siswa', 14, 18);

  // Metadata Info Box
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);

  let currentY = 32;
  const leftX = 14;
  const rightX = pageWidth / 2 + 10;

  // Left Column
  doc.setFont('helvetica', 'bold');
  doc.text('Nama Sekolah:', leftX, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(options.sekolah.namaSekolah || 'SD/MI Mitra Siswa', leftX + 28, currentY);

  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Kelas:', leftX, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(options.namaKelas || 'Semua Kelas', leftX + 28, currentY);

  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Wali Kelas:', leftX, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(options.waliKelas || options.sekolah.namaWaliKelas || '-', leftX + 28, currentY);

  // Right Column
  currentY = 32;
  doc.setFont('helvetica', 'bold');
  doc.text('Tahun Ajaran:', rightX, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(options.tahunAjaran || options.sekolah.tahunAjaran || '-', rightX + 28, currentY);

  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Periode:', rightX, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(options.periode || 'Semua Waktu', rightX + 28, currentY);

  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Tanggal Cetak:', rightX, currentY);
  doc.setFont('helvetica', 'normal');
  const todayStr = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date());
  doc.text(todayStr, rightX + 28, currentY);

  // Divider Line
  currentY += 8;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, currentY, pageWidth - 14, currentY);

  currentY += 4;

  // Table Data
  const tableRows = options.data.map((item, index) => [
    (index + 1).toString(),
    item.nis ? `${item.namaSiswa}\n(NIS: ${item.nis})` : item.namaSiswa,
    item.kelasNama,
    formatRupiah(item.totalSetoran),
    formatRupiah(item.totalPenarikan),
    formatRupiah(item.saldo),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['No', 'Nama Siswa', 'Kelas', 'Setoran', 'Penarikan', 'Saldo']],
    body: tableRows,
    foot: [
      [
        '',
        'TOTAL REKAPITULASI',
        '',
        formatRupiah(options.totalSetoran),
        formatRupiah(options.totalPenarikan),
        formatRupiah(options.totalSaldo),
      ],
    ],
    theme: 'striped',
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 3,
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 55 },
      2: { cellWidth: 25 },
      3: { cellWidth: 32, halign: 'right' },
      4: { cellWidth: 32, halign: 'right' },
      5: { cellWidth: 32, halign: 'right' },
    },
    didDrawPage: (data) => {
      // Footer on every page
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);

      // Left footer
      doc.text(
        'SimSis - Simpanan Siswa | Dibuat oleh MSD Temanggung by Umar',
        14,
        pageHeight - 8
      );

      // Right footer (page number)
      const pageNumber = (doc as any).internal.getNumberOfPages();
      doc.text(
        `Halaman ${data.pageNumber} dari ${pageNumber}`,
        pageWidth - 14,
        pageHeight - 8,
        { align: 'right' }
      );
    },
  });

  return doc;
}

export function downloadLaporanPdf(options: GeneratePdfOptions, filename?: string) {
  const doc = generateLaporanPdf(options);
  const finalName = filename || `Laporan_SimSis_${options.namaKelas.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  doc.save(finalName);
}

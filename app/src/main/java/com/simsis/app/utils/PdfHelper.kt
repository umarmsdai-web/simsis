package com.simsis.app.utils

import android.content.Context
import android.content.Intent
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import android.widget.Toast
import androidx.core.content.FileProvider
import com.simsis.app.viewmodel.RekapItemUi
import java.io.File
import java.io.FileOutputStream

object PdfHelper {

    /**
     * Buat berkas PDF Laporan Rekap Simpanan menggunakan android.graphics.pdf.PdfDocument native
     */
    fun generateAndSharePdf(
        context: Context,
        namaSekolah: String,
        namaKelas: String,
        waliKelas: String,
        tahunAjaran: String,
        periode: String,
        rekapList: List<RekapItemUi>,
        totalSaldo: Long
    ) {
        try {
            val pdfDoc = PdfDocument()
            val pageWidth = 595 // A4 standard width in points (72 dpi)
            val pageHeight = 842 // A4 standard height

            val pageInfo = PdfDocument.PageInfo.Builder(pageWidth, pageHeight, 1).create()
            val page = pdfDoc.startPage(pageInfo)
            val canvas: Canvas = page.canvas

            val paint = Paint()

            // Header Banner
            paint.color = Color.parseColor("#1E40AF")
            canvas.drawRect(0f, 0f, pageWidth.toFloat(), 70f, paint)

            paint.color = Color.WHITE
            paint.textSize = 20f
            paint.isFakeBoldText = true
            canvas.drawText("SimSis (Simpanan Siswa)", 30f, 38f, paint)

            paint.textSize = 11f
            paint.isFakeBoldText = false
            canvas.drawText("Laporan Rekapitulasi Tabungan Siswa", 30f, 56f, paint)

            // School & Class Metadata
            paint.color = Color.parseColor("#1E293B")
            paint.textSize = 10f
            var yPos = 100f

            paint.isFakeBoldText = true
            canvas.drawText("Nama Sekolah:", 30f, yPos, paint)
            paint.isFakeBoldText = false
            canvas.drawText(namaSekolah.ifBlank { "SD / MI Mitra" }, 120f, yPos, paint)

            paint.isFakeBoldText = true
            canvas.drawText("Tahun Ajaran:", 340f, yPos, paint)
            paint.isFakeBoldText = false
            canvas.drawText(tahunAjaran.ifBlank { "2026/2027" }, 430f, yPos, paint)

            yPos += 18f
            paint.isFakeBoldText = true
            canvas.drawText("Kelas:", 30f, yPos, paint)
            paint.isFakeBoldText = false
            canvas.drawText(namaKelas.ifBlank { "Semua Kelas" }, 120f, yPos, paint)

            paint.isFakeBoldText = true
            canvas.drawText("Periode:", 340f, yPos, paint)
            paint.isFakeBoldText = false
            canvas.drawText(periode, 430f, yPos, paint)

            yPos += 18f
            paint.isFakeBoldText = true
            canvas.drawText("Wali Kelas:", 30f, yPos, paint)
            paint.isFakeBoldText = false
            canvas.drawText(waliKelas.ifBlank { "-" }, 120f, yPos, paint)

            // Divider Line
            yPos += 16f
            paint.color = Color.parseColor("#CBD5E1")
            paint.strokeWidth = 1f
            canvas.drawLine(30f, yPos, (pageWidth - 30).toFloat(), yPos, paint)

            // Table Header
            yPos += 20f
            paint.color = Color.parseColor("#F1F5F9")
            canvas.drawRect(30f, yPos - 14f, (pageWidth - 30).toFloat(), yPos + 6f, paint)

            paint.color = Color.parseColor("#0F172A")
            paint.isFakeBoldText = true
            paint.textSize = 9.5f
            canvas.drawText("No", 36f, yPos, paint)
            canvas.drawText("Nama Siswa", 70f, yPos, paint)
            canvas.drawText("Setoran", 300f, yPos, paint)
            canvas.drawText("Penarikan", 400f, yPos, paint)
            canvas.drawText("Saldo", 490f, yPos, paint)

            paint.isFakeBoldText = false

            // Table Rows
            rekapList.forEachIndexed { index, item ->
                yPos += 18f
                if (yPos > pageHeight - 60f) return@forEachIndexed // prevent page overflow

                paint.color = Color.parseColor("#334155")
                canvas.drawText("${index + 1}", 36f, yPos, paint)
                canvas.drawText(item.namaSiswa.take(30), 70f, yPos, paint)

                paint.color = Color.parseColor("#059669")
                canvas.drawText(FormatHelper.formatRupiah(item.setoran), 300f, yPos, paint)

                paint.color = Color.parseColor("#E11D48")
                canvas.drawText(FormatHelper.formatRupiah(item.penarikan), 400f, yPos, paint)

                paint.color = Color.parseColor("#1E40AF")
                paint.isFakeBoldText = true
                canvas.drawText(FormatHelper.formatRupiah(item.saldo), 490f, yPos, paint)
                paint.isFakeBoldText = false
            }

            // Summary Total
            yPos += 24f
            paint.color = Color.parseColor("#E2E8F0")
            canvas.drawLine(30f, yPos - 12f, (pageWidth - 30).toFloat(), yPos - 12f, paint)

            paint.color = Color.parseColor("#0F172A")
            paint.isFakeBoldText = true
            paint.textSize = 11f
            canvas.drawText("TOTAL SALDO:", 300f, yPos + 4f, paint)
            paint.color = Color.parseColor("#1E40AF")
            canvas.drawText(FormatHelper.formatRupiah(totalSaldo), 460f, yPos + 4f, paint)

            // Footer (Section 17 & 39)
            paint.color = Color.parseColor("#94A3B8")
            paint.textSize = 8.5f
            paint.isFakeBoldText = false
            canvas.drawText(
                "SimSis - Simpanan Siswa | Dibuat oleh MSD Temanggung by Umar",
                30f,
                (pageHeight - 20).toFloat(),
                paint
            )

            pdfDoc.finishPage(page)

            // Write to app cache/files
            val reportsDir = File(context.cacheDir, "reports")
            if (!reportsDir.exists()) reportsDir.mkdirs()

            val pdfFile = File(reportsDir, "Laporan_SimSis_${System.currentTimeMillis()}.pdf")
            val outputStream = FileOutputStream(pdfFile)
            pdfDoc.writeTo(outputStream)
            outputStream.close()
            pdfDoc.close()

            // Share PDF intent
            val contentUri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                pdfFile
            )

            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "application/pdf"
                putExtra(Intent.EXTRA_STREAM, contentUri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(Intent.createChooser(shareIntent, "Bagikan Laporan PDF SimSis"))

        } catch (e: Exception) {
            Toast.makeText(context, "Gagal membuat PDF: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }
}

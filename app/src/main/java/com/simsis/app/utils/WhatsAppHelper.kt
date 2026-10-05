package com.simsis.app.utils

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import com.simsis.app.data.entity.JenisTransaksi
import com.simsis.app.data.entity.Siswa
import com.simsis.app.data.entity.Transaksi
import com.simsis.app.viewmodel.RekapItemUi
import java.net.URLEncoder

object WhatsAppHelper {
    const val MSD_PHONE = "6282138950006"

    /**
     * Normalisasi nomor telepon ke format internasional Indonesia 62
     * Contoh: 082138950006 -> 6282138950006
     */
    fun normalizePhone(phone: String?): String? {
        if (phone.isNullOrBlank()) return null
        var cleaned = phone.replace(Regex("[^0-9]"), "")
        if (cleaned.startsWith("0")) {
            cleaned = "62" + cleaned.substring(1)
        } else if (!cleaned.startsWith("62") && cleaned.length > 5) {
            cleaned = "62" + cleaned
        }
        return if (cleaned.length >= 8) cleaned else null
    }

    /**
     * Buka WhatsApp menggunakan deep link Intent
     */
    fun openWhatsApp(context: Context, phone: String?, message: String) {
        try {
            val encodedMessage = URLEncoder.encode(message, "UTF-8")
            val targetPhone = normalizePhone(phone)

            val uri = if (!targetPhone.isNullOrBlank()) {
                Uri.parse("https://wa.me/$targetPhone?text=$encodedMessage")
            } else {
                Uri.parse("https://wa.me/?text=$encodedMessage")
            }

            val intent = Intent(Intent.ACTION_VIEW, uri).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(context, "WhatsApp tidak ditemukan di perangkat ini.", Toast.LENGTH_SHORT).show()
        }
    }

    /**
     * Format pesan bukti transaksi siswa
     */
    fun buildTransaksiText(
        namaSiswa: String,
        kelasNama: String,
        tanggal: String,
        jenis: JenisTransaksi,
        nominal: Long,
        saldoSaatIni: Long,
        keterangan: String?
    ): String {
        val tanggalIndo = FormatHelper.formatTanggalIndo(tanggal)
        val nominalFormatted = FormatHelper.formatRupiah(nominal)
        val saldoFormatted = FormatHelper.formatRupiah(saldoSaatIni)
        val jenisText = if (jenis == JenisTransaksi.SETORAN) "SETORAN" else "PENARIKAN"

        val sb = StringBuilder()
        sb.append("*SIMSIS - SIMPANAN SISWA*\n\n")
        sb.append("Nama: $namaSiswa\n")
        sb.append("Kelas: $kelasNama\n")
        sb.append("Tanggal: $tanggalIndo\n\n")
        sb.append("Transaksi: $jenisText\n")
        sb.append("Nominal: $nominalFormatted\n")
        if (!keterangan.isNullOrBlank()) {
            sb.append("Keterangan: $keterangan\n")
        }
        sb.append("\nSaldo saat ini: $saldoFormatted\n\n")
        sb.append("Terima kasih.")
        return sb.toString()
    }

    /**
     * Format pesan laporan simpanan kelas
     */
    fun buildLaporanText(
        namaKelas: String,
        periodeStr: String,
        rekapList: List<RekapItemUi>,
        totalSaldo: Long
    ): String {
        val sb = StringBuilder()
        sb.append("*LAPORAN SIMPANAN SISWA*\n\n")
        sb.append("Kelas: $namaKelas\n")
        sb.append("Periode: $periodeStr\n\n")

        rekapList.forEachIndexed { index, item ->
            sb.append("${index + 1}. ${item.namaSiswa}\n")
            sb.append("   Setoran: ${FormatHelper.formatRupiah(item.setoran)}\n")
            sb.append("   Penarikan: ${FormatHelper.formatRupiah(item.penarikan)}\n")
            sb.append("   Saldo: ${FormatHelper.formatRupiah(item.saldo)}\n\n")
        }

        sb.append("---\n\n")
        sb.append("TOTAL SALDO: ${FormatHelper.formatRupiah(totalSaldo)}\n\n")
        sb.append("Laporan dibuat menggunakan aplikasi SimSis.")
        return sb.toString()
    }

    /**
     * Hubungi pembuat MSD Temanggung by Umar
     */
    fun contactMSD(context: Context) {
        val message = "Halo MSD Temanggung by Umar, saya ingin mendapatkan informasi tentang aplikasi SimSis."
        openWhatsApp(context, MSD_PHONE, message)
    }
}

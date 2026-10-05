package com.simsis.app.utils

import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object FormatHelper {
    private val localeId = Locale("id", "ID")
    private val rupiahFormat = NumberFormat.getCurrencyInstance(localeId).apply {
        maximumFractionDigits = 0
        minimumFractionDigits = 0
    }

    /**
     * Format angka ke Rupiah. Contoh: 150000 -> "Rp150.000"
     */
    fun formatRupiah(nominal: Long): String {
        return rupiahFormat.format(nominal).replace(" ", "")
    }

    /**
     * Format tanggal YYYY-MM-DD ke format Indonesia panjang.
     * Contoh: "2026-10-05" -> "05 Oktober 2026"
     */
    fun formatTanggalIndo(dateStr: String): String {
        return try {
            val parser = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val date = parser.parse(dateStr) ?: return dateStr
            val formatter = SimpleDateFormat("dd MMMM yyyy", localeId)
            formatter.format(date)
        } catch (e: Exception) {
            dateStr
        }
    }

    /**
     * Format tanggal ringkas DD/MM/YYYY.
     * Contoh: "2026-10-05" -> "05/10/2026"
     */
    fun formatTanggalRingkas(dateStr: String): String {
        return try {
            val parts = dateStr.split("-")
            if (parts.size == 3) "${parts[2]}/${parts[1]}/${parts[0]}" else dateStr
        } catch (e: Exception) {
            dateStr
        }
    }

    /**
     * Tanggal hari ini dalam format YYYY-MM-DD
     */
    fun getTodayString(): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        return sdf.format(Date())
    }

    /**
     * Bersihkan input string angka rupiah menjadi Long
     */
    fun parseRupiahInput(input: String): Long {
        val clean = input.replace(Regex("[^0-9]"), "")
        return clean.toLongOrNull() ?: 0L
    }
}

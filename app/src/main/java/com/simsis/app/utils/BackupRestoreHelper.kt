package com.simsis.app.utils

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.core.content.FileProvider
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.simsis.app.data.database.AppDatabase
import com.simsis.app.data.entity.Kelas
import com.simsis.app.data.entity.Pengaturan
import com.simsis.app.data.entity.Siswa
import com.simsis.app.data.entity.Transaksi
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import java.io.File
import java.io.InputStreamReader

data class SimSisBackupPayload(
    val app: String = "SimSis",
    val version: String = "1.0.0",
    val creator: String = "MSD Temanggung by Umar",
    val exportedAt: Long = System.currentTimeMillis(),
    val kelasList: List<Kelas>,
    val siswaList: List<Siswa>,
    val transaksiList: List<Transaksi>,
    val pengaturan: Pengaturan?
)

object BackupRestoreHelper {

    private val gson: Gson = GsonBuilder().setPrettyPrinting().create()

    suspend fun createBackupJson(context: Context, db: AppDatabase): File? = withContext(Dispatchers.IO) {
        try {
            val payload = SimSisBackupPayload(
                kelasList = db.kelasDao().getAllKelas().first(),
                siswaList = db.siswaDao().getAllActiveSiswa().first(),
                transaksiList = db.transaksiDao().getAllTransaksi().first(),
                pengaturan = db.pengaturanDao().getPengaturan()
            )

            val jsonString = gson.toJson(payload)
            val today = FormatHelper.getTodayString()
            val filename = "simsis_backup_$today.json"

            val backupDir = File(context.cacheDir, "backups")
            if (!backupDir.exists()) backupDir.mkdirs()

            val backupFile = File(backupDir, filename)
            backupFile.writeText(jsonString)
            backupFile
        } catch (e: Exception) {
            null
        }
    }

    suspend fun restoreFromJsonUri(context: Context, uri: Uri, db: AppDatabase): Boolean = withContext(Dispatchers.IO) {
        try {
            val inputStream = context.contentResolver.openInputStream(uri) ?: return@withContext false
            val reader = InputStreamReader(inputStream)
            val payload = gson.fromJson(reader, SimSisBackupPayload::class.java)
            reader.close()

            if (payload == null || payload.siswaList == null) {
                return@withContext false
            }

            // Restore in transaction
            db.transaksiDao().deleteAllTransaksi()
            db.siswaDao().deleteAllSiswa()
            db.kelasDao().deleteAllKelas()

            payload.kelasList.forEach { db.kelasDao().insertKelas(it) }
            payload.siswaList.forEach { db.siswaDao().insertSiswa(it) }
            payload.transaksiList.forEach { db.transaksiDao().insertTransaksi(it) }
            payload.pengaturan?.let { db.pengaturanDao().insertOrUpdate(it) }

            true
        } catch (e: Exception) {
            false
        }
    }
}

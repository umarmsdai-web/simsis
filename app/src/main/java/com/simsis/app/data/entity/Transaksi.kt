package com.simsis.app.data.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

enum class JenisTransaksi {
    SETORAN,
    PENARIKAN
}

@Entity(
    tableName = "transaksi",
    foreignKeys = [
        ForeignKey(
            entity = Siswa::class,
            parentColumns = ["id"],
            childColumns = ["siswaId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["siswaId"])]
)
data class Transaksi(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val siswaId: Long,
    val tanggal: String, // Format YYYY-MM-DD
    val jenisTransaksi: JenisTransaksi,
    val nominal: Long,
    val keterangan: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)

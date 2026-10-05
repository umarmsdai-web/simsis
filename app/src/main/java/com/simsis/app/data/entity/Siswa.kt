package com.simsis.app.data.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "siswa",
    foreignKeys = [
        ForeignKey(
            entity = Kelas::class,
            parentColumns = ["id"],
            childColumns = ["kelasId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["kelasId"])]
)
data class Siswa(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val kelasId: Long,
    val nis: String = "",
    val namaSiswa: String,
    val jenisKelamin: String = "L", // "L" (Laki-laki) atau "P" (Perempuan)
    val nomorWhatsApp: String? = null,
    val statusAktif: Boolean = true,
    val createdAt: Long = System.currentTimeMillis()
)

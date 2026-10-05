package com.simsis.app.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "kelas")
data class Kelas(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val namaKelas: String,
    val namaWaliKelas: String = "",
    val tahunAjaran: String = "2026/2027",
    val createdAt: Long = System.currentTimeMillis()
)

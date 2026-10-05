package com.simsis.app.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "pengaturan")
data class Pengaturan(
    @PrimaryKey
    val id: Int = 1,
    val namaSekolah: String = "",
    val alamatSekolah: String = "",
    val namaWaliKelas: String = "",
    val tahunAjaran: String = "2026/2027",
    val formatMataUang: String = "IDR"
)

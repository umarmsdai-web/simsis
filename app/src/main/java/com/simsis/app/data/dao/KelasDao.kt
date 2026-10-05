package com.simsis.app.data.dao

import androidx.room.*
import com.simsis.app.data.entity.Kelas
import kotlinx.coroutines.flow.Flow

@Dao
interface KelasDao {
    @Query("SELECT * FROM kelas ORDER BY namaKelas ASC")
    fun getAllKelas(): Flow<List<Kelas>>

    @Query("SELECT * FROM kelas WHERE id = :id LIMIT 1")
    suspend fun getKelasById(id: Long): Kelas?

    @Query("SELECT * FROM kelas WHERE LOWER(namaKelas) = LOWER(:nama) LIMIT 1")
    suspend fun getKelasByNama(nama: String): Kelas?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertKelas(kelas: Kelas): Long

    @Update
    suspend fun updateKelas(kelas: Kelas)

    @Delete
    suspend fun deleteKelas(kelas: Kelas)

    @Query("DELETE FROM kelas")
    suspend fun deleteAllKelas()
}

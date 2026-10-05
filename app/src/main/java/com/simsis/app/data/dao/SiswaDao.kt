package com.simsis.app.data.dao

import androidx.room.*
import com.simsis.app.data.entity.Siswa
import kotlinx.coroutines.flow.Flow

data class SiswaWithKelas(
    @Embedded val siswa: Siswa,
    val namaKelas: String?
)

@Dao
interface SiswaDao {
    @Query("SELECT * FROM siswa WHERE statusAktif = 1 ORDER BY namaSiswa ASC")
    fun getAllActiveSiswa(): Flow<List<Siswa>>

    @Query("""
        SELECT s.*, k.namaKelas as namaKelas 
        FROM siswa s 
        LEFT JOIN kelas k ON s.kelasId = k.id 
        WHERE s.statusAktif = 1 
        ORDER BY s.namaSiswa ASC
    """)
    fun getAllActiveSiswaWithKelas(): Flow<List<SiswaWithKelas>>

    @Query("SELECT * FROM siswa WHERE kelasId = :kelasId AND statusAktif = 1 ORDER BY namaSiswa ASC")
    fun getSiswaByKelas(kelasId: Long): Flow<List<Siswa>>

    @Query("SELECT * FROM siswa WHERE id = :id LIMIT 1")
    suspend fun getSiswaById(id: Long): Siswa?

    @Query("SELECT * FROM siswa WHERE id = :id LIMIT 1")
    fun getSiswaFlowById(id: Long): Flow<Siswa?>

    @Query("SELECT * FROM siswa WHERE (namaSiswa LIKE '%' || :query || '%' OR nis LIKE '%' || :query || '%') AND statusAktif = 1 ORDER BY namaSiswa ASC")
    fun searchSiswa(query: String): Flow<List<Siswa>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSiswa(siswa: Siswa): Long

    @Update
    suspend fun updateSiswa(siswa: Siswa)

    @Query("UPDATE siswa SET statusAktif = 0 WHERE id = :id")
    suspend fun softDeleteSiswa(id: Long)

    @Delete
    suspend fun deleteSiswa(siswa: Siswa)

    @Query("SELECT COUNT(*) FROM siswa WHERE statusAktif = 1")
    fun getActiveSiswaCount(): Flow<Int>

    @Query("DELETE FROM siswa")
    suspend fun deleteAllSiswa()
}

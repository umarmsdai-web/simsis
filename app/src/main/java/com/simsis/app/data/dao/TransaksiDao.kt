package com.simsis.app.data.dao

import androidx.room.*
import com.simsis.app.data.entity.Transaksi
import kotlinx.coroutines.flow.Flow

data class SiswaSaldoTuple(
    val siswaId: Long,
    val saldo: Long
)

@Dao
interface TransaksiDao {
    @Query("SELECT * FROM transaksi ORDER BY tanggal DESC, id DESC")
    fun getAllTransaksi(): Flow<List<Transaksi>>

    @Query("SELECT * FROM transaksi WHERE siswaId = :siswaId ORDER BY tanggal DESC, id DESC")
    fun getTransaksiBySiswa(siswaId: Long): Flow<List<Transaksi>>

    @Query("SELECT * FROM transaksi WHERE siswaId = :siswaId ORDER BY tanggal ASC, id ASC")
    suspend fun getTransaksiAscending(siswaId: Long): List<Transaksi>

    // Dynamic Balance Calculation: Saldo = Total Setoran - Total Penarikan
    @Query("""
        SELECT COALESCE(
            (SELECT SUM(nominal) FROM transaksi WHERE siswaId = :siswaId AND jenisTransaksi = 'SETORAN'), 0
        ) - COALESCE(
            (SELECT SUM(nominal) FROM transaksi WHERE siswaId = :siswaId AND jenisTransaksi = 'PENARIKAN'), 0
        )
    """)
    fun getSaldoSiswa(siswaId: Long): Flow<Long>

    @Query("""
        SELECT COALESCE(
            (SELECT SUM(nominal) FROM transaksi WHERE siswaId = :siswaId AND jenisTransaksi = 'SETORAN'), 0
        ) - COALESCE(
            (SELECT SUM(nominal) FROM transaksi WHERE siswaId = :siswaId AND jenisTransaksi = 'PENARIKAN'), 0
        )
    """)
    suspend fun getSaldoSiswaSync(siswaId: Long): Long

    // Dashboard metrics: Total balance across all active students
    @Query("""
        SELECT COALESCE(
            (SELECT SUM(t.nominal) FROM transaksi t INNER JOIN siswa s ON t.siswaId = s.id WHERE t.jenisTransaksi = 'SETORAN' AND s.statusAktif = 1), 0
        ) - COALESCE(
            (SELECT SUM(t.nominal) FROM transaksi t INNER JOIN siswa s ON t.siswaId = s.id WHERE t.jenisTransaksi = 'PENARIKAN' AND s.statusAktif = 1), 0
        )
    """)
    fun getTotalSimpananAll(): Flow<Long>

    @Query("""
        SELECT COALESCE(SUM(t.nominal), 0) 
        FROM transaksi t 
        INNER JOIN siswa s ON t.siswaId = s.id 
        WHERE t.jenisTransaksi = 'SETORAN' AND t.tanggal = :today AND s.statusAktif = 1
    """)
    fun getSetoranHariIni(today: String): Flow<Long>

    @Query("""
        SELECT COALESCE(SUM(t.nominal), 0) 
        FROM transaksi t 
        INNER JOIN siswa s ON t.siswaId = s.id 
        WHERE t.jenisTransaksi = 'PENARIKAN' AND t.tanggal = :today AND s.statusAktif = 1
    """)
    fun getPenarikanHariIni(today: String): Flow<Long>

    @Query("""
        SELECT siswaId, 
        (COALESCE(SUM(CASE WHEN jenisTransaksi = 'SETORAN' THEN nominal ELSE 0 END), 0) -
         COALESCE(SUM(CASE WHEN jenisTransaksi = 'PENARIKAN' THEN nominal ELSE 0 END), 0)) as saldo
        FROM transaksi
        GROUP BY siswaId
    """)
    fun getAllSiswaBalances(): Flow<List<SiswaSaldoTuple>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaksi(transaksi: Transaksi): Long

    @Delete
    suspend fun deleteTransaksi(transaksi: Transaksi)

    @Query("DELETE FROM transaksi")
    suspend fun deleteAllTransaksi()
}

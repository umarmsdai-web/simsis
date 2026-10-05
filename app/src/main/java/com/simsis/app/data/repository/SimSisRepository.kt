package com.simsis.app.data.repository

import com.simsis.app.data.dao.KelasDao
import com.simsis.app.data.dao.PengaturanDao
import com.simsis.app.data.dao.SiswaDao
import com.simsis.app.data.dao.SiswaWithKelas
import com.simsis.app.data.dao.TransaksiDao
import com.simsis.app.data.entity.JenisTransaksi
import com.simsis.app.data.entity.Kelas
import com.simsis.app.data.entity.Pengaturan
import com.simsis.app.data.entity.Siswa
import com.simsis.app.data.entity.Transaksi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first

class SimSisRepository(
    private val kelasDao: KelasDao,
    private val siswaDao: SiswaDao,
    private val transaksiDao: TransaksiDao,
    private val pengaturanDao: PengaturanDao
) {
    // --- KELAS ---
    val allKelas: Flow<List<Kelas>> = kelasDao.getAllKelas()
    suspend fun getKelasById(id: Long) = kelasDao.getKelasById(id)
    suspend fun getKelasByNama(nama: String) = kelasDao.getKelasByNama(nama)
    suspend fun insertKelas(kelas: Kelas): Long = kelasDao.insertKelas(kelas)
    suspend fun updateKelas(kelas: Kelas) = kelasDao.updateKelas(kelas)
    suspend fun deleteKelas(kelas: Kelas) = kelasDao.deleteKelas(kelas)

    // --- SISWA ---
    val allActiveSiswa: Flow<List<Siswa>> = siswaDao.getAllActiveSiswa()
    val allActiveSiswaWithKelas: Flow<List<SiswaWithKelas>> = siswaDao.getAllActiveSiswaWithKelas()
    val activeSiswaCount: Flow<Int> = siswaDao.getActiveSiswaCount()

    fun getSiswaByKelas(kelasId: Long): Flow<List<Siswa>> = siswaDao.getSiswaByKelas(kelasId)
    fun searchSiswa(query: String): Flow<List<Siswa>> = siswaDao.searchSiswa(query)
    suspend fun getSiswaById(id: Long): Siswa? = siswaDao.getSiswaById(id)
    fun getSiswaFlowById(id: Long): Flow<Siswa?> = siswaDao.getSiswaFlowById(id)

    suspend fun insertSiswa(siswa: Siswa): Long = siswaDao.insertSiswa(siswa)
    suspend fun updateSiswa(siswa: Siswa) = siswaDao.updateSiswa(siswa)
    suspend fun softDeleteSiswa(id: Long) = siswaDao.softDeleteSiswa(id)

    // --- TRANSAKSI & SALDO ---
    val allTransaksi: Flow<List<Transaksi>> = transaksiDao.getAllTransaksi()
    fun getTransaksiBySiswa(siswaId: Long): Flow<List<Transaksi>> = transaksiDao.getTransaksiBySiswa(siswaId)
    suspend fun getTransaksiAscending(siswaId: Long): List<Transaksi> = transaksiDao.getTransaksiAscending(siswaId)

    fun getSaldoSiswa(siswaId: Long): Flow<Long> = transaksiDao.getSaldoSiswa(siswaId)
    suspend fun getSaldoSiswaSync(siswaId: Long): Long = transaksiDao.getSaldoSiswaSync(siswaId)

    val totalSimpananAll: Flow<Long> = transaksiDao.getTotalSimpananAll()
    fun getSetoranHariIni(today: String): Flow<Long> = transaksiDao.getSetoranHariIni(today)
    fun getPenarikanHariIni(today: String): Flow<Long> = transaksiDao.getPenarikanHariIni(today)

    suspend fun simpanTransaksi(transaksi: Transaksi): Result<Long> {
        if (transaksi.nominal <= 0) {
            return Result.failure(IllegalArgumentException("Nominal harus lebih besar dari Rp0."))
        }
        if (transaksi.jenisTransaksi == JenisTransaksi.PENARIKAN) {
            val saldoSaatIni = transaksiDao.getSaldoSiswaSync(transaksi.siswaId)
            if (transaksi.nominal > saldoSaatIni) {
                return Result.failure(IllegalStateException("Saldo tidak mencukupi."))
            }
        }
        val id = transaksiDao.insertTransaksi(transaksi)
        return Result.success(id)
    }

    suspend fun deleteTransaksi(transaksi: Transaksi) = transaksiDao.deleteTransaksi(transaksi)

    // --- PENGATURAN ---
    val pengaturanFlow: Flow<Pengaturan?> = pengaturanDao.getPengaturanFlow()
    suspend fun getPengaturan(): Pengaturan = pengaturanDao.getPengaturan() ?: Pengaturan()
    suspend fun savePengaturan(pengaturan: Pengaturan) = pengaturanDao.insertOrUpdate(pengaturan)

    // --- RESET DATABASE ---
    suspend fun resetAllData() {
        transaksiDao.deleteAllTransaksi()
        siswaDao.deleteAllSiswa()
        kelasDao.deleteAllKelas()
        pengaturanDao.deletePengaturan()
    }
}

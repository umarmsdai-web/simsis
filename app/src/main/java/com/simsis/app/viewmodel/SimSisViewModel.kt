package com.simsis.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.simsis.app.data.dao.SiswaWithKelas
import com.simsis.app.data.entity.JenisTransaksi
import com.simsis.app.data.entity.Kelas
import com.simsis.app.data.entity.Pengaturan
import com.simsis.app.data.entity.Siswa
import com.simsis.app.data.entity.Transaksi
import com.simsis.app.data.repository.SimSisRepository
import com.simsis.app.utils.FormatHelper
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class DashboardUiState(
    val jumlahSiswa: Int = 0,
    val totalSimpanan: Long = 0L,
    val setoranHariIni: Long = 0L,
    val penarikanHariIni: Long = 0L,
    val isLoading: Boolean = false
)

data class SiswaItemUi(
    val siswa: Siswa,
    val namaKelas: String,
    val saldo: Long
)

data class MutasiItemUi(
    val id: Long,
    val tanggal: String,
    val jenisTransaksi: JenisTransaksi,
    val keterangan: String,
    val masuk: Long,
    val keluar: Long,
    val saldoBerjalan: Long
)

data class RekapItemUi(
    val siswaId: Long,
    val nis: String,
    val namaSiswa: String,
    val namaKelas: String,
    val setoran: Long,
    val penarikan: Long,
    val saldo: Long
)

class SimSisViewModel(private val repository: SimSisRepository) : ViewModel() {

    private val today = FormatHelper.getTodayString()

    // Dashboard State
    val dashboardState: StateFlow<DashboardUiState> = combine(
        repository.activeSiswaCount,
        repository.totalSimpananAll,
        repository.getSetoranHariIni(today),
        repository.getPenarikanHariIni(today)
    ) { count, total, setoran, penarikan ->
        DashboardUiState(
            jumlahSiswa = count,
            totalSimpanan = total,
            setoranHariIni = setoran,
            penarikanHariIni = penarikan
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), DashboardUiState())

    // All active classes
    val allKelas: StateFlow<List<Kelas>> = repository.allKelas
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // All active students with class name and dynamic balance
    val allActiveSiswaWithKelas: StateFlow<List<SiswaWithKelas>> = repository.allActiveSiswaWithKelas
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Recent 5 transactions for dashboard
    val recentTransactions: StateFlow<List<Transaksi>> = repository.allTransaksi
        .map { it.take(5) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Pengaturan
    val pengaturan: StateFlow<Pengaturan> = repository.pengaturanFlow
        .map { it ?: Pengaturan() }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), Pengaturan())

    // --- OPERASI SISWA & KELAS ---
    fun tambahSiswa(
        nama: String,
        nis: String,
        kelasIdOrName: String,
        isNewKelas: Boolean,
        jenisKelamin: String,
        nomorWhatsApp: String?,
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) {
        viewModelScope.launch {
            if (nama.isBlank()) {
                onError("Nama siswa wajib diisi.")
                return@launch
            }

            var finalKelasId: Long = 0
            if (isNewKelas) {
                if (kelasIdOrName.isBlank()) {
                    onError("Nama kelas wajib diisi.")
                    return@launch
                }
                val existing = repository.getKelasByNama(kelasIdOrName.trim())
                finalKelasId = existing?.id ?: repository.insertKelas(
                    Kelas(namaKelas = kelasIdOrName.trim())
                )
            } else {
                finalKelasId = kelasIdOrName.toLongOrNull() ?: 0
            }

            if (finalKelasId == 0L) {
                onError("Kelas wajib dipilih.")
                return@launch
            }

            val siswa = Siswa(
                kelasId = finalKelasId,
                namaSiswa = nama.trim(),
                nis = nis.trim(),
                jenisKelamin = jenisKelamin,
                nomorWhatsApp = nomorWhatsApp?.trim()?.ifBlank { null },
                statusAktif = true
            )
            repository.insertSiswa(siswa)
            onSuccess()
        }
    }

    fun updateSiswa(siswa: Siswa, onSuccess: () -> Unit) {
        viewModelScope.launch {
            repository.updateSiswa(siswa)
            onSuccess()
        }
    }

    fun hapusSiswa(id: Long, onSuccess: () -> Unit) {
        viewModelScope.launch {
            repository.softDeleteSiswa(id)
            onSuccess()
        }
    }

    fun getSiswaFlow(id: Long): Flow<Siswa?> = repository.getSiswaFlowById(id)
    fun getSaldoFlow(id: Long): Flow<Long> = repository.getSaldoSiswa(id)
    suspend fun getSaldoSync(id: Long): Long = repository.getSaldoSiswaSync(id)

    // --- OPERASI TRANSAKSI ---
    fun simpanTransaksi(
        siswaId: Long,
        jenis: JenisTransaksi,
        nominal: Long,
        tanggal: String,
        keterangan: String?,
        onSuccess: (Long, Long) -> Unit, // returns txId, newBalance
        onError: (String) -> Unit
    ) {
        viewModelScope.launch {
            val tx = Transaksi(
                siswaId = siswaId,
                jenisTransaksi = jenis,
                nominal = nominal,
                tanggal = tanggal,
                keterangan = keterangan?.trim()?.ifBlank { null }
            )
            val result = repository.simpanTransaksi(tx)
            result.onSuccess { txId ->
                val newBalance = repository.getSaldoSiswaSync(siswaId)
                onSuccess(txId, newBalance)
            }.onFailure { ex ->
                onError(ex.message ?: "Terjadi kesalahan. Silakan coba lagi.")
            }
        }
    }

    fun hapusTransaksi(transaksi: Transaksi) {
        viewModelScope.launch {
            repository.deleteTransaksi(transaksi)
        }
    }

    // --- MUTASI KRONOLOGIS ---
    fun getMutasiSiswa(siswaId: Long): Flow<List<MutasiItemUi>> {
        return repository.getTransaksiBySiswa(siswaId).map { txList ->
            // Chronological order to compute running balance
            val sortedAsc = txList.sortedWith(compareBy({ it.tanggal }, { it.id }))
            var running = 0L
            val computed = sortedAsc.map { t ->
                val isSetor = t.jenisTransaksi == JenisTransaksi.SETORAN
                val masuk = if (isSetor) t.nominal else 0L
                val keluar = if (isSetor) 0L else t.nominal
                running += (masuk - keluar)
                if (running < 0L) running = 0L

                MutasiItemUi(
                    id = t.id,
                    tanggal = t.tanggal,
                    jenisTransaksi = t.jenisTransaksi,
                    keterangan = t.keterangan ?: if (isSetor) "Setoran Tabungan" else "Penarikan Tabungan",
                    masuk = masuk,
                    keluar = keluar,
                    saldoBerjalan = running
                )
            }
            computed.reversed() // return newest first for display
        }
    }

    // --- PENGATURAN ---
    fun simpanPengaturan(namaSekolah: String, alamat: String, waliKelas: String, tahunAjaran: String) {
        viewModelScope.launch {
            repository.savePengaturan(
                Pengaturan(
                    id = 1,
                    namaSekolah = namaSekolah.trim(),
                    alamatSekolah = alamat.trim(),
                    namaWaliKelas = waliKelas.trim(),
                    tahunAjaran = tahunAjaran.trim()
                )
            )
        }
    }

    fun resetSemuaData(onComplete: () -> Unit) {
        viewModelScope.launch {
            repository.resetAllData()
            onComplete()
        }
    }
}

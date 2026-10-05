package com.simsis.app.ui.navigation

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Dashboard : Screen("dashboard")
    object Siswa : Screen("siswa")
    object DetailSiswa : Screen("siswa_detail/{siswaId}") {
        fun createRoute(siswaId: Long) = "siswa_detail/$siswaId"
    }
    object TambahTransaksi : Screen("tambah_transaksi?siswaId={siswaId}&jenis={jenis}") {
        fun createRoute(siswaId: Long? = null, jenis: String? = null): String {
            val s = if (siswaId != null) "siswaId=$siswaId" else ""
            val j = if (jenis != null) "jenis=$jenis" else ""
            val params = listOf(s, j).filter { it.isNotBlank() }.joinToString("&")
            return if (params.isNotBlank()) "tambah_transaksi?$params" else "tambah_transaksi"
        }
    }
    object Mutasi : Screen("mutasi?siswaId={siswaId}") {
        fun createRoute(siswaId: Long? = null) = if (siswaId != null) "mutasi?siswaId=$siswaId" else "mutasi"
    }
    object Laporan : Screen("laporan")
    object Pengaturan : Screen("pengaturan")
    object About : Screen("about")
}

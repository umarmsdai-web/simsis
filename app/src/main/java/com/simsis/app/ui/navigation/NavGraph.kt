package com.simsis.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.simsis.app.ui.screens.*
import com.simsis.app.viewmodel.SimSisViewModel

@Composable
fun SimSisNavGraph(
    navController: NavHostController,
    viewModel: SimSisViewModel
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route
    ) {
        // 1. Splash Screen
        composable(Screen.Splash.route) {
            SplashScreen(
                onNavigateToDashboard = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                }
            )
        }

        // 2. Dashboard Screen
        composable(Screen.Dashboard.route) {
            DashboardScreen(
                viewModel = viewModel,
                onNavigateTambahTransaksi = { siswaId, jenis ->
                    navController.navigate(Screen.TambahTransaksi.createRoute(siswaId, jenis))
                },
                onNavigateDataSiswa = {
                    navController.navigate(Screen.Siswa.route)
                },
                onNavigateMutasi = { siswaId ->
                    navController.navigate(Screen.Mutasi.createRoute(siswaId))
                },
                onNavigateLaporan = {
                    navController.navigate(Screen.Laporan.route)
                },
                onNavigatePengaturan = {
                    navController.navigate(Screen.Pengaturan.route)
                },
                onNavigateDetailSiswa = { siswaId ->
                    navController.navigate(Screen.DetailSiswa.createRoute(siswaId))
                }
            )
        }

        // 3. Siswa Screen
        composable(Screen.Siswa.route) {
            SiswaScreen(
                viewModel = viewModel,
                onNavigateBack = { navController.popBackStack() },
                onNavigateDetailSiswa = { siswaId ->
                    navController.navigate(Screen.DetailSiswa.createRoute(siswaId))
                }
            )
        }

        // 4. Detail Siswa Screen
        composable(
            route = Screen.DetailSiswa.route,
            arguments = listOf(navArgument("siswaId") { type = NavType.LongType })
        ) { backStackEntry ->
            val siswaId = backStackEntry.arguments?.getLong("siswaId") ?: 0L
            DetailSiswaScreen(
                siswaId = siswaId,
                viewModel = viewModel,
                onNavigateBack = { navController.popBackStack() },
                onNavigateTambahTransaksi = { sId, jenis ->
                    navController.navigate(Screen.TambahTransaksi.createRoute(sId, jenis))
                },
                onNavigateMutasi = { sId ->
                    navController.navigate(Screen.Mutasi.createRoute(sId))
                }
            )
        }

        // 5. Tambah Transaksi Screen
        composable(
            route = Screen.TambahTransaksi.route,
            arguments = listOf(
                navArgument("siswaId") {
                    type = NavType.StringType
                    nullable = true
                    defaultValue = null
                },
                navArgument("jenis") {
                    type = NavType.StringType
                    nullable = true
                    defaultValue = null
                }
            )
        ) { backStackEntry ->
            val siswaIdStr = backStackEntry.arguments?.getString("siswaId")
            val jenis = backStackEntry.arguments?.getString("jenis")
            val siswaId = siswaIdStr?.toLongOrNull()

            TambahTransaksiScreen(
                initialSiswaId = siswaId,
                initialJenis = jenis,
                viewModel = viewModel,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // 6. Mutasi Screen
        composable(
            route = Screen.Mutasi.route,
            arguments = listOf(
                navArgument("siswaId") {
                    type = NavType.StringType
                    nullable = true
                    defaultValue = null
                }
            )
        ) { backStackEntry ->
            val siswaIdStr = backStackEntry.arguments?.getString("siswaId")
            val siswaId = siswaIdStr?.toLongOrNull()

            MutasiScreen(
                initialSiswaId = siswaId,
                viewModel = viewModel,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // 7. Laporan Screen
        composable(Screen.Laporan.route) {
            LaporanScreen(
                viewModel = viewModel,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // 8. Pengaturan Screen
        composable(Screen.Pengaturan.route) {
            PengaturanScreen(
                viewModel = viewModel,
                onNavigateBack = { navController.popBackStack() },
                onNavigateAbout = { navController.navigate(Screen.About.route) }
            )
        }

        // 9. About Screen
        composable(Screen.About.route) {
            AboutScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}

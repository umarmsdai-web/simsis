package com.simsis.app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.simsis.app.data.entity.JenisTransaksi
import com.simsis.app.utils.FormatHelper
import com.simsis.app.viewmodel.SimSisViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    viewModel: SimSisViewModel,
    onNavigateTambahTransaksi: (Long?, String?) -> Unit,
    onNavigateDataSiswa: () -> Unit,
    onNavigateMutasi: (Long?) -> Unit,
    onNavigateLaporan: () -> Unit,
    onNavigatePengaturan: () -> Unit,
    onNavigateDetailSiswa: (Long) -> Unit
) {
    val state by viewModel.dashboardState.collectAsState()
    val recentTx by viewModel.recentTransactions.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("SimSis", fontWeight = FontWeight.ExtraBold, fontSize = 20.sp, color = Color.White)
                        Text("Simpanan Siswa", fontSize = 12.sp, color = Color(0xFFDBEAFE))
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.primary),
                actions = {
                    IconButton(onClick = onNavigatePengaturan) {
                        Icon(Icons.Default.Settings, contentDescription = "Pengaturan", tint = Color.White)
                    }
                }
            )
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { onNavigateTambahTransaksi(null, "SETORAN") },
                icon = { Icon(Icons.Default.Add, contentDescription = null) },
                text = { Text("+ Transaksi", fontWeight = FontWeight.Bold) },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = Color.White,
                shape = RoundedCornerShape(18.dp)
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Banner Total Simpanan
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary)
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Text(
                            text = "TOTAL SIMPANAN SELURUH SISWA",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFDBEAFE),
                            letterSpacing = 0.5.sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = FormatHelper.formatRupiah(state.totalSimpanan),
                            fontSize = 32.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White
                        )
                    }
                }
            }

            // 3 Summary Metric Cards
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Jumlah Siswa
                    Card(
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.People, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Siswa", fontSize = 11.sp, color = Color(0xFF64748B))
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text("${state.jumlahSiswa} siswa", fontSize = 15.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    // Setoran Hari Ini
                    Card(
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.ArrowDownward, contentDescription = null, tint = Color(0xFF059669), modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Setor Hari Ini", fontSize = 11.sp, color = Color(0xFF64748B))
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(FormatHelper.formatRupiah(state.setoranHariIni), fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFF059669))
                        }
                    }

                    // Penarikan Hari Ini
                    Card(
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.ArrowUpward, contentDescription = null, tint = Color(0xFFE11D48), modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Tarik Hari Ini", fontSize = 11.sp, color = Color(0xFF64748B))
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(FormatHelper.formatRupiah(state.penarikanHariIni), fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFFE11D48))
                        }
                    }
                }
            }

            // Menu Utama (Section 5: Data Siswa, Transaksi, Mutasi, Laporan, Pengaturan)
            item {
                Text(
                    text = "MENU UTAMA",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF64748B),
                    letterSpacing = 0.5.sp
                )
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    val menuItems = listOf(
                        Triple("Data Siswa", Icons.Default.Group, onNavigateDataSiswa),
                        Triple("Transaksi", Icons.Default.SwapHoriz, { onNavigateTambahTransaksi(null, null) }),
                        Triple("Mutasi", Icons.Default.History, { onNavigateMutasi(null) }),
                        Triple("Laporan", Icons.Default.Assessment, onNavigateLaporan),
                        Triple("Pengaturan", Icons.Default.Settings, onNavigatePengaturan)
                    )

                    menuItems.forEach { (label, icon, onClick) ->
                        Card(
                            modifier = Modifier
                                .weight(1f)
                                .clickable { onClick() },
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White)
                        ) {
                            Column(
                                modifier = Modifier
                                    .padding(vertical = 12.dp, horizontal = 4.dp)
                                    .fillMaxWidth(),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(icon, contentDescription = label, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(24.dp))
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(label, fontSize = 10.sp, fontWeight = FontWeight.SemiBold, maxLines = 1)
                            }
                        }
                    }
                }
            }

            // Transaksi Terbaru
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "TRANSAKSI TERBARU",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF64748B),
                        letterSpacing = 0.5.sp
                    )
                    TextButton(onClick = { onNavigateMutasi(null) }) {
                        Text("Lihat Semua", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            if (recentTx.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White)
                    ) {
                        Column(
                            modifier = Modifier
                                .padding(24.dp)
                                .fillMaxWidth(),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text("Belum ada transaksi.", fontSize = 13.sp, color = Color(0xFF94A3B8))
                            Spacer(modifier = Modifier.height(8.dp))
                            Button(
                                onClick = { onNavigateTambahTransaksi(null, "SETORAN") },
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Text("+ Tambah Transaksi Pertama")
                            }
                        }
                    }
                }
            } else {
                items(recentTx) { tx ->
                    val isSetor = tx.jenisTransaksi == JenisTransaksi.SETORAN
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onNavigateDetailSiswa(tx.siswaId) },
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White)
                    ) {
                        Row(
                            modifier = Modifier
                                .padding(14.dp)
                                .fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = if (isSetor) Icons.Default.ArrowDownward else Icons.Default.ArrowUpward,
                                    contentDescription = null,
                                    tint = if (isSetor) Color(0xFF059669) else Color(0xFFE11D48),
                                    modifier = Modifier.size(24.dp)
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Column {
                                    Text(
                                        text = tx.keterangan ?: if (isSetor) "Setoran Tabungan" else "Penarikan Tabungan",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp
                                    )
                                    Text(
                                        text = FormatHelper.formatTanggalIndo(tx.tanggal),
                                        fontSize = 11.sp,
                                        color = Color(0xFF64748B)
                                    )
                                }
                            }

                            Text(
                                text = "${if (isSetor) "+" else "-"} ${FormatHelper.formatRupiah(tx.nominal)}",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = if (isSetor) Color(0xFF059669) else Color(0xFFE11D48)
                            )
                        }
                    }
                }
            }
        }
    }
}

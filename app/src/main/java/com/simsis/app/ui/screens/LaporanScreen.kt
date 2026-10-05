package com.simsis.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.simsis.app.utils.FormatHelper
import com.simsis.app.utils.PdfHelper
import com.simsis.app.utils.WhatsAppHelper
import com.simsis.app.viewmodel.RekapItemUi
import com.simsis.app.viewmodel.SimSisViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LaporanScreen(
    viewModel: SimSisViewModel,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val allSiswaWithKelas by viewModel.allActiveSiswaWithKelas.collectAsState()
    val allKelas by viewModel.allKelas.collectAsState()
    val pengaturan by viewModel.pengaturan.collectAsState()

    var selectedKelasId by remember { mutableStateOf<Long?>(null) }
    var selectedPeriod by remember { mutableStateOf("Semua") }

    val activeKelasNama = remember(selectedKelasId, allKelas) {
        if (selectedKelasId == null) "Semua Kelas" else (allKelas.find { it.id == selectedKelasId }?.namaKelas ?: "-")
    }

    // Prepare list of Rekap items
    val rekapList = remember(allSiswaWithKelas, selectedKelasId) {
        val filtered = if (selectedKelasId == null) {
            allSiswaWithKelas
        } else {
            allSiswaWithKelas.filter { it.siswa.kelasId == selectedKelasId }
        }

        filtered.map { item ->
            RekapItemUi(
                siswaId = item.siswa.id,
                nis = item.siswa.nis,
                namaSiswa = item.siswa.namaSiswa,
                namaKelas = item.namaKelas ?: "-",
                setoran = 0L,
                penarikan = 0L,
                saldo = 0L
            )
        }
    }

    // Dynamic balances for rekap
    var totalKeseluruhan by remember { mutableStateOf(0L) }
    var computedRekapList by remember { mutableStateOf<List<RekapItemUi>>(emptyList()) }

    LaunchedEffect(rekapList) {
        var grandTotal = 0L
        val updated = rekapList.map { item ->
            val s = viewModel.getSaldoSync(item.siswaId)
            grandTotal += s
            item.copy(saldo = s)
        }
        computedRekapList = updated
        totalKeseluruhan = grandTotal
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Laporan Simpanan", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Kembali", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.primary),
                actions = {
                    IconButton(onClick = {
                        val msg = WhatsAppHelper.buildLaporanText(
                            namaKelas = activeKelasNama,
                            periodeStr = selectedPeriod,
                            rekapList = computedRekapList,
                            totalSaldo = totalKeseluruhan
                        )
                        WhatsAppHelper.openWhatsApp(context, null, msg)
                    }) {
                        Icon(Icons.Default.Share, contentDescription = "Bagikan ke WhatsApp", tint = Color.White)
                    }

                    IconButton(onClick = {
                        PdfHelper.generateAndSharePdf(
                            context = context,
                            namaSekolah = pengaturan.namaSekolah,
                            namaKelas = activeKelasNama,
                            waliKelas = pengaturan.namaWaliKelas,
                            tahunAjaran = pengaturan.tahunAjaran,
                            periode = selectedPeriod,
                            rekapList = computedRekapList,
                            totalSaldo = totalKeseluruhan
                        )
                    }) {
                        Icon(Icons.Default.PictureAsPdf, contentDescription = "Export PDF", tint = Color.White)
                    }
                }
            )
        }
    ) { padding ->
        if (allSiswaWithKelas.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize().padding(padding).padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.Description, contentDescription = null, tint = Color(0xFFCBD5E1), modifier = Modifier.size(56.dp))
                    Spacer(modifier = Modifier.height(12.dp))
                    Text("Belum ada data untuk ditampilkan.", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = Color(0xFF64748B))
                }
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
            ) {
                // Filter Card (Kelas & Periode)
                Card(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("FILTER LAPORAN", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF64748B))
                        Spacer(modifier = Modifier.height(8.dp))

                        // Kelas Selector
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedButton(
                                onClick = { selectedKelasId = null },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.outlinedButtonColors(
                                    containerColor = if (selectedKelasId == null) MaterialTheme.colorScheme.primary.copy(alpha = 0.1f) else Color.Transparent
                                )
                            ) {
                                Text("Semua Kelas", fontSize = 11.sp)
                            }

                            allKelas.take(2).forEach { k ->
                                OutlinedButton(
                                    onClick = { selectedKelasId = k.id },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.outlinedButtonColors(
                                        containerColor = if (selectedKelasId == k.id) MaterialTheme.colorScheme.primary.copy(alpha = 0.1f) else Color.Transparent
                                    )
                                ) {
                                    Text("Kelas ${k.namaKelas}", fontSize = 11.sp)
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))
                        HorizontalDivider(color = Color(0xFFF1F5F9))
                        Spacer(modifier = Modifier.height(10.dp))

                        // Grand Total Banner
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("TOTAL REKAPITULASI", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF64748B))
                            Text(
                                text = FormatHelper.formatRupiah(totalKeseluruhan),
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Black,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }

                // Table / List of students in report
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    itemsIndexed(computedRekapList) { index, item ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White)
                        ) {
                            Row(
                                modifier = Modifier.padding(14.dp).fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = "${index + 1}.",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp,
                                        color = Color(0xFF94A3B8),
                                        modifier = Modifier.width(24.dp)
                                    )
                                    Column {
                                        Text(item.namaSiswa, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                        Text("Kelas ${item.namaKelas} · NIS: ${item.nis.ifBlank { "-" }}", fontSize = 11.sp, color = Color(0xFF64748B))
                                    }
                                }

                                Text(
                                    text = FormatHelper.formatRupiah(item.saldo),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

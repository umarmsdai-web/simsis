package com.simsis.app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import com.simsis.app.data.entity.JenisTransaksi
import com.simsis.app.utils.FormatHelper
import com.simsis.app.utils.WhatsAppHelper
import com.simsis.app.viewmodel.SimSisViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MutasiScreen(
    initialSiswaId: Long?,
    viewModel: SimSisViewModel,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val allSiswaWithKelas by viewModel.allActiveSiswaWithKelas.collectAsState()

    var selectedSiswaId by remember {
        mutableStateOf(initialSiswaId ?: allSiswaWithKelas.firstOrNull()?.siswa?.id)
    }

    var selectedPeriod by remember { mutableStateOf("Semua") }

    val selectedSiswa = remember(selectedSiswaId, allSiswaWithKelas) {
        allSiswaWithKelas.find { it.siswa.id == selectedSiswaId }
    }

    val rawMutasiList by remember(selectedSiswaId) {
        if (selectedSiswaId != null) {
            viewModel.getMutasiSiswa(selectedSiswaId!!)
        } else {
            kotlinx.coroutines.flow.flowOf(emptyList())
        }
    }.collectAsState(initial = emptyList())

    val todayStr = FormatHelper.getTodayString()

    // Filter by period
    val filteredMutasi = remember(rawMutasiList, selectedPeriod) {
        when (selectedPeriod) {
            "Hari Ini" -> rawMutasiList.filter { it.tanggal == todayStr }
            "Bulan Ini" -> {
                val prefix = todayStr.take(7) // YYYY-MM
                rawMutasiList.filter { it.tanggal.startsWith(prefix) }
            }
            else -> rawMutasiList
        }
    }

    val saldo by remember(selectedSiswaId) {
        if (selectedSiswaId != null) {
            viewModel.getSaldoFlow(selectedSiswaId!!)
        } else {
            kotlinx.coroutines.flow.flowOf(0L)
        }
    }.collectAsState(initial = 0L)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mutasi Simpanan", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Kembali", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.primary),
                actions = {
                    selectedSiswa?.let { s ->
                        IconButton(onClick = {
                            val msg = StringBuilder()
                            msg.append("*MUTASI SIMPANAN SISWA*\n\n")
                            msg.append("Nama: ${s.siswa.namaSiswa}\n")
                            msg.append("Kelas: ${s.namaKelas ?: "-"}\n")
                            msg.append("Saldo Saat Ini: ${FormatHelper.formatRupiah(saldo)}\n")
                            msg.append("Periode: $selectedPeriod\n\n")
                            filteredMutasi.forEachIndexed { i, m ->
                                msg.append("${i + 1}. ${FormatHelper.formatTanggalRingkas(m.tanggal)} | ${m.keterangan}\n")
                                msg.append("   ${if (m.jenisTransaksi == JenisTransaksi.SETORAN) "Setor (+)" else "Tarik (-)"}: ${FormatHelper.formatRupiah(if (m.jenisTransaksi == JenisTransaksi.SETORAN) m.masuk else m.keluar)}\n")
                                msg.append("   Saldo: ${FormatHelper.formatRupiah(m.saldoBerjalan)}\n\n")
                            }
                            msg.append("Dibuat oleh SimSis - MSD Temanggung by Umar")
                            WhatsAppHelper.openWhatsApp(context, s.siswa.nomorWhatsApp, msg.toString())
                        }) {
                            Icon(Icons.Default.Share, contentDescription = "Bagikan", tint = Color.White)
                        }
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
                    Icon(Icons.Default.PeopleOutline, contentDescription = null, tint = Color(0xFF94A3B8), modifier = Modifier.size(56.dp))
                    Spacer(modifier = Modifier.height(12.dp))
                    Text("Belum ada data siswa.", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Tambahkan data siswa terlebih dahulu untuk melihat mutasi.", fontSize = 12.sp, color = Color(0xFF64748B))
                }
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
            ) {
                // Siswa Selector Dropdown & Saldo Summary
                var dropdownExpanded by remember { mutableStateOf(false) }

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("PILIH SISWA", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF64748B))
                        Spacer(modifier = Modifier.height(6.dp))

                        Box {
                            OutlinedCard(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { dropdownExpanded = true },
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp).fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = selectedSiswa?.let { "${it.siswa.namaSiswa} (Kelas ${it.namaKelas})" } ?: "Pilih Siswa",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp
                                    )
                                    Icon(Icons.Default.ArrowDropDown, contentDescription = null)
                                }
                            }

                            DropdownMenu(
                                expanded = dropdownExpanded,
                                onDismissRequest = { dropdownExpanded = false }
                            ) {
                                allSiswaWithKelas.forEach { item ->
                                    DropdownMenuItem(
                                        text = { Text("${item.siswa.namaSiswa} (Kelas ${item.namaKelas})") },
                                        onClick = {
                                            selectedSiswaId = item.siswa.id
                                            dropdownExpanded = false
                                        }
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Saldo Saat Ini", fontSize = 12.sp, color = Color(0xFF64748B))
                            Text(FormatHelper.formatRupiah(saldo), fontSize = 18.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)
                        }
                    }
                }

                // Period Filter Chips (Section 12: Hari ini, Minggu ini, Bulan ini, Semua)
                LazyRow(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf("Semua", "Hari Ini", "Bulan Ini").forEach { period ->
                        item {
                            FilterChip(
                                selected = selectedPeriod == period,
                                onClick = { selectedPeriod = period },
                                label = { Text(period) }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Mutasi List
                if (filteredMutasi.isEmpty()) {
                    Box(modifier = Modifier.fillMaxSize().padding(32.dp), contentAlignment = Alignment.Center) {
                        Text("Belum ada mutasi transaksi pada periode ini.", fontSize = 12.sp, color = Color(0xFF94A3B8))
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(filteredMutasi) { item ->
                            val isSetor = item.jenisTransaksi == JenisTransaksi.SETORAN

                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(containerColor = Color.White)
                            ) {
                                Row(
                                    modifier = Modifier.padding(14.dp).fillMaxWidth(),
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
                                        Spacer(modifier = Modifier.width(10.dp))
                                        Column {
                                            Text(item.keterangan, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                            Text(FormatHelper.formatTanggalRingkas(item.tanggal), fontSize = 11.sp, color = Color(0xFF64748B))
                                        }
                                    }

                                    Column(horizontalAlignment = Alignment.End) {
                                        Text(
                                            text = "${if (isSetor) "+" else "-"} ${FormatHelper.formatRupiah(if (isSetor) item.masuk else item.keluar)}",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 13.sp,
                                            color = if (isSetor) Color(0xFF059669) else Color(0xFFE11D48)
                                        )
                                        Text(
                                            text = "Saldo: ${FormatHelper.formatRupiah(item.saldoBerjalan)}",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            color = Color(0xFF1E40AF)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

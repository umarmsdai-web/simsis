package com.simsis.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
fun DetailSiswaScreen(
    siswaId: Long,
    viewModel: SimSisViewModel,
    onNavigateBack: () -> Unit,
    onNavigateTambahTransaksi: (Long, String) -> Unit,
    onNavigateMutasi: (Long) -> Unit
) {
    val context = LocalContext.current
    val siswa by viewModel.getSiswaFlow(siswaId).collectAsState(initial = null)
    val saldo by viewModel.getSaldoFlow(siswaId).collectAsState(initial = 0L)
    val allKelas by viewModel.allKelas.collectAsState()
    val mutasiList by viewModel.getMutasiSiswa(siswaId).collectAsState(initial = emptyList())

    var showDeleteConfirm by remember { mutableStateOf(false) }

    val namaKelas = remember(siswa, allKelas) {
        val kId = siswa?.kelasId
        allKelas.find { it.id == kId }?.namaKelas ?: "-"
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Detail Siswa", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Kembali", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.primary),
                actions = {
                    IconButton(onClick = { showDeleteConfirm = true }) {
                        Icon(Icons.Default.Delete, contentDescription = "Hapus Siswa", tint = Color(0xFFFCA5A5))
                    }
                }
            )
        }
    ) { padding ->
        siswa?.let { currentSiswa ->
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Siswa Header Card & Big Saldo (Section 8)
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(24.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary)
                    ) {
                        Column(modifier = Modifier.padding(20.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.Top
                            ) {
                                Column {
                                    Surface(
                                        shape = RoundedCornerShape(12.dp),
                                        color = Color.White.copy(alpha = 0.2f)
                                    ) {
                                        Text(
                                            text = "Kelas $namaKelas",
                                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color.White
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = currentSiswa.namaSiswa,
                                        fontSize = 20.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                    Text(
                                        text = "NIS: ${currentSiswa.nis.ifBlank { "-" }} · ${if (currentSiswa.jenisKelamin == "L") "Laki-Laki" else "Perempuan"}",
                                        fontSize = 12.sp,
                                        color = Color(0xFFDBEAFE)
                                    )
                                }

                                if (!currentSiswa.nomorWhatsApp.isNullOrBlank()) {
                                    Surface(
                                        shape = RoundedCornerShape(12.dp),
                                        color = Color(0xFF059669)
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Icon(Icons.Default.Phone, contentDescription = null, tint = Color.White, modifier = Modifier.size(12.dp))
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text("WA", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                        }
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(20.dp))
                            HorizontalDivider(color = Color.White.copy(alpha = 0.2f))
                            Spacer(modifier = Modifier.height(14.dp))

                            Text("SALDO TABUNGAN SAAT INI", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFFDBEAFE))
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = FormatHelper.formatRupiah(saldo),
                                fontSize = 32.sp,
                                fontWeight = FontWeight.Black,
                                color = Color.White
                            )
                        }
                    }
                }

                // 4 Action Buttons: + Setoran, - Penarikan, Mutasi, Kirim WhatsApp (Section 8)
                item {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(
                                onClick = { onNavigateTambahTransaksi(siswaId, "SETORAN") },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(16.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF059669))
                            ) {
                                Icon(Icons.Default.Add, contentDescription = null)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("+ Setoran", fontWeight = FontWeight.Bold)
                            }

                            Button(
                                onClick = { onNavigateTambahTransaksi(siswaId, "PENARIKAN") },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(16.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE11D48))
                            ) {
                                Icon(Icons.Default.Remove, contentDescription = null)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("- Penarikan", fontWeight = FontWeight.Bold)
                            }
                        }

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedButton(
                                onClick = { onNavigateMutasi(siswaId) },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(16.dp)
                            ) {
                                Icon(Icons.Default.History, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Mutasi", fontWeight = FontWeight.Bold)
                            }

                            Button(
                                onClick = {
                                    val text = WhatsAppHelper.buildTransaksiText(
                                        namaSiswa = currentSiswa.namaSiswa,
                                        kelasNama = namaKelas,
                                        tanggal = FormatHelper.getTodayString(),
                                        jenis = JenisTransaksi.SETORAN,
                                        nominal = 0L,
                                        saldoSaatIni = saldo,
                                        keterangan = "Status Saldo Terkini"
                                    )
                                    WhatsAppHelper.openWhatsApp(context, currentSiswa.nomorWhatsApp, text)
                                },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(16.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF25D366))
                            ) {
                                Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Kirim WA", fontWeight = FontWeight.Bold, color = Color.White)
                            }
                        }
                    }
                }

                // Recent transactions for this student
                item {
                    Text(
                        text = "TRANSAKSI TERAKHIR",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF64748B),
                        letterSpacing = 0.5.sp
                    )
                }

                if (mutasiList.isEmpty()) {
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White)
                        ) {
                            Box(modifier = Modifier.padding(24.dp).fillMaxWidth(), contentAlignment = Alignment.Center) {
                                Text("Belum ada riwayat transaksi.", fontSize = 12.sp, color = Color(0xFF94A3B8))
                            }
                        }
                    }
                } else {
                    items(mutasiList.take(6)) { item ->
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
                                        modifier = Modifier.size(22.dp)
                                    )
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Column {
                                        Text(item.keterangan, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                        Text(FormatHelper.formatTanggalIndo(item.tanggal), fontSize = 11.sp, color = Color(0xFF64748B))
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
                                        color = Color(0xFF64748B)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        } ?: run {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        }
    }

    // Confirmation Dialog before deleting student (Section 27)
    if (showDeleteConfirm) {
        AlertDialog(
            onDismissRequest = { showDeleteConfirm = false },
            title = { Text("Hapus Siswa?", fontWeight = FontWeight.Bold) },
            text = { Text("Apakah Anda yakin ingin menghapus siswa ini? Histori transaksi tetap disimpan aman.") },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.hapusSiswa(siswaId) {
                            showDeleteConfirm = false
                            onNavigateBack()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Hapus")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteConfirm = false }) {
                    Text("Batal")
                }
            }
        )
    }
}

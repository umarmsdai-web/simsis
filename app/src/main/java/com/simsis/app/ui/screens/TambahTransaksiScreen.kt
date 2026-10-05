package com.simsis.app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.simsis.app.data.entity.JenisTransaksi
import com.simsis.app.utils.FormatHelper
import com.simsis.app.utils.WhatsAppHelper
import com.simsis.app.viewmodel.SimSisViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TambahTransaksiScreen(
    initialSiswaId: Long?,
    initialJenis: String?,
    viewModel: SimSisViewModel,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val allSiswaWithKelas by viewModel.allActiveSiswaWithKelas.collectAsState()

    var selectedSiswaId by remember {
        mutableStateOf(initialSiswaId ?: allSiswaWithKelas.firstOrNull()?.siswa?.id)
    }
    var jenisTransaksi by remember {
        mutableStateOf(if (initialJenis == "PENARIKAN") JenisTransaksi.PENARIKAN else JenisTransaksi.SETORAN)
    }
    var nominalInput by remember { mutableStateOf("") }
    var tanggalInput by remember { mutableStateOf(FormatHelper.getTodayString()) }
    var keteranganInput by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf("") }

    // Dialog state after successful transaction
    var showWhatsAppPrompt by remember { mutableStateOf(false) }
    var savedTxId by remember { mutableStateOf<Long?>(null) }
    var savedNewBalance by remember { mutableStateOf(0L) }

    val selectedSiswaItem = remember(selectedSiswaId, allSiswaWithKelas) {
        allSiswaWithKelas.find { it.siswa.id == selectedSiswaId }
    }

    var saldoSaatIni by remember { mutableStateOf(0L) }
    LaunchedEffect(selectedSiswaId) {
        selectedSiswaId?.let { id ->
            saldoSaatIni = viewModel.getSaldoSync(id)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Tambah Transaksi", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Kembali", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.primary)
            )
        }
    ) { padding ->
        if (allSiswaWithKelas.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.PersonOff, contentDescription = null, tint = Color(0xFF94A3B8), modifier = Modifier.size(56.dp))
                    Spacer(modifier = Modifier.height(12.dp))
                    Text("Belum ada data siswa.", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Silakan tambah data siswa terlebih dahulu sebelum mencatat transaksi.", fontSize = 12.sp, color = Color(0xFF64748B))
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(onClick = onNavigateBack, shape = RoundedCornerShape(12.dp)) {
                        Text("Kembali ke Siswa")
                    }
                }
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                if (errorMessage.isNotEmpty()) {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.ErrorOutline, contentDescription = null, tint = MaterialTheme.colorScheme.error)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(errorMessage, fontSize = 12.sp, color = MaterialTheme.colorScheme.onErrorContainer, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }

                // Pilih Siswa Dropdown Card
                var dropdownExpanded by remember { mutableStateOf(false) }

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("PILIH SISWA", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF64748B))
                        Spacer(modifier = Modifier.height(8.dp))

                        Box {
                            OutlinedCard(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { dropdownExpanded = true },
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Row(
                                    modifier = Modifier.padding(14.dp).fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = selectedSiswaItem?.let { "${it.siswa.namaSiswa} (Kelas ${it.namaKelas})" } ?: "Pilih Siswa",
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

                        Spacer(modifier = Modifier.height(10.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Saldo saat ini:", fontSize = 12.sp, color = Color(0xFF64748B))
                            Text(FormatHelper.formatRupiah(saldoSaatIni), fontSize = 13.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                        }
                    }
                }

                // Jenis Transaksi Toggle
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("JENIS TRANSAKSI", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF64748B))
                        Spacer(modifier = Modifier.height(10.dp))

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Button(
                                onClick = { jenisTransaksi = JenisTransaksi.SETORAN },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (jenisTransaksi == JenisTransaksi.SETORAN) Color(0xFF059669) else Color(0xFFF1F5F9),
                                    contentColor = if (jenisTransaksi == JenisTransaksi.SETORAN) Color.White else Color(0xFF475569)
                                )
                            ) {
                                Icon(Icons.Default.ArrowDownward, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("SETORAN (+)", fontWeight = FontWeight.Bold)
                            }

                            Button(
                                onClick = { jenisTransaksi = JenisTransaksi.PENARIKAN },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (jenisTransaksi == JenisTransaksi.PENARIKAN) Color(0xFFE11D48) else Color(0xFFF1F5F9),
                                    contentColor = if (jenisTransaksi == JenisTransaksi.PENARIKAN) Color.White else Color(0xFF475569)
                                )
                            ) {
                                Icon(Icons.Default.ArrowUpward, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("PENARIKAN (-)", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }

                // Nominal Input Card (Section 9)
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("NOMINAL TRANSAKSI (RP)", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF64748B))
                        Spacer(modifier = Modifier.height(8.dp))

                        OutlinedTextField(
                            value = nominalInput,
                            onValueChange = { input ->
                                val clean = input.filter { it.isDigit() }
                                nominalInput = if (clean.isNotEmpty()) {
                                    val longVal = clean.toLongOrNull() ?: 0L
                                    FormatHelper.formatRupiah(longVal).replace("Rp", "")
                                } else ""
                            },
                            prefix = { Text("Rp ", fontWeight = FontWeight.Bold) },
                            placeholder = { Text("20.000") },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(10.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf(10000L, 20000L, 50000L, 100000L).forEach { amt ->
                                OutlinedButton(
                                    onClick = { nominalInput = FormatHelper.formatRupiah(amt).replace("Rp", "") },
                                    modifier = Modifier.weight(1f),
                                    contentPadding = PaddingValues(horizontal = 4.dp, vertical = 6.dp),
                                    shape = RoundedCornerShape(10.dp)
                                ) {
                                    Text("+${amt / 1000}k", fontSize = 11.sp)
                                }
                            }
                        }
                    }
                }

                // Tanggal & Keterangan
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedTextField(
                            value = tanggalInput,
                            onValueChange = { tanggalInput = it },
                            label = { Text("Tanggal (YYYY-MM-DD)") },
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        )

                        OutlinedTextField(
                            value = keteranganInput,
                            onValueChange = { keteranganInput = it },
                            label = { Text("Keterangan (Opsional)") },
                            placeholder = { Text("Contoh: Tabungan mingguan") },
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }

                // Submit Button
                Button(
                    onClick = {
                        errorMessage = ""
                        val siswaId = selectedSiswaId
                        if (siswaId == null) {
                            errorMessage = "Pilih siswa terlebih dahulu."
                            return@Button
                        }
                        val nominalLong = FormatHelper.parseRupiahInput(nominalInput)
                        if (nominalLong <= 0L) {
                            errorMessage = "Nominal harus lebih besar dari Rp0."
                            return@Button
                        }

                        viewModel.simpanTransaksi(
                            siswaId = siswaId,
                            jenis = jenisTransaksi,
                            nominal = nominalLong,
                            tanggal = tanggalInput,
                            keterangan = keteranganInput,
                            onSuccess = { txId, newBalance ->
                                savedTxId = txId
                                savedNewBalance = newBalance
                                showWhatsAppPrompt = true
                            },
                            onError = { err ->
                                errorMessage = err
                            }
                        )
                    },
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Icon(Icons.Default.Check, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Simpan Transaksi", fontSize = 15.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }

    // Confirmation: Kirim bukti transaksi melalui WhatsApp? (Section 10 & 11)
    if (showWhatsAppPrompt && selectedSiswaItem != null) {
        val nominalLong = FormatHelper.parseRupiahInput(nominalInput)
        val waText = WhatsAppHelper.buildTransaksiText(
            namaSiswa = selectedSiswaItem.siswa.namaSiswa,
            kelasNama = selectedSiswaItem.namaKelas ?: "-",
            tanggal = tanggalInput,
            jenis = jenisTransaksi,
            nominal = nominalLong,
            saldoSaatIni = savedNewBalance,
            keterangan = keteranganInput
        )

        AlertDialog(
            onDismissRequest = {
                showWhatsAppPrompt = false
                onNavigateBack()
            },
            title = { Text("Transaksi Berhasil Disimpan", fontWeight = FontWeight.Bold) },
            text = {
                Column {
                    Text("Kirim bukti transaksi ini melalui WhatsApp?")
                    Spacer(modifier = Modifier.height(10.dp))
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = Color(0xFFF1F5F9),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = waText,
                            fontSize = 11.sp,
                            modifier = Modifier.padding(10.dp),
                            color = Color(0xFF334155)
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        WhatsAppHelper.openWhatsApp(context, selectedSiswaItem.siswa.nomorWhatsApp, waText)
                        showWhatsAppPrompt = false
                        onNavigateBack()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF25D366))
                ) {
                    Text("Ya, Kirim WhatsApp", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = {
                    showWhatsAppPrompt = false
                    onNavigateBack()
                }) {
                    Text("Tidak")
                }
            }
        )
    }
}

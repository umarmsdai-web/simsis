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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.simsis.app.utils.FormatHelper
import com.simsis.app.viewmodel.SimSisViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SiswaScreen(
    viewModel: SimSisViewModel,
    onNavigateBack: () -> Unit,
    onNavigateDetailSiswa: (Long) -> Unit
) {
    val allSiswaWithKelas by viewModel.allActiveSiswaWithKelas.collectAsState()
    val allKelas by viewModel.allKelas.collectAsState()

    var searchQuery by remember { mutableStateOf("") }
    var selectedKelasId by remember { mutableStateOf<Long?>(null) }
    var showAddDialog by remember { mutableStateOf(false) }

    // Filter siswa
    val filteredSiswa = remember(allSiswaWithKelas, searchQuery, selectedKelasId) {
        allSiswaWithKelas.filter { item ->
            val matchQuery = searchQuery.isBlank() ||
                    item.siswa.namaSiswa.contains(searchQuery, ignoreCase = true) ||
                    item.siswa.nis.contains(searchQuery, ignoreCase = true)
            val matchKelas = selectedKelasId == null || item.siswa.kelasId == selectedKelasId
            matchQuery && matchKelas
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Data Siswa", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Kembali", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.primary),
                actions = {
                    IconButton(onClick = { showAddDialog = true }) {
                        Icon(Icons.Default.PersonAdd, contentDescription = "Tambah Siswa", tint = Color.White)
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = Color.White,
                shape = RoundedCornerShape(18.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = "Tambah Siswa")
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Search Input
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                placeholder = { Text("Cari siswa atau NIS...", fontSize = 13.sp) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(Icons.Default.Clear, contentDescription = "Hapus")
                        }
                    }
                },
                singleLine = true,
                shape = RoundedCornerShape(16.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White
                )
            )

            // Kelas Filter Chips
            if (allKelas.isNotEmpty()) {
                LazyRow(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    item {
                        FilterChip(
                            selected = selectedKelasId == null,
                            onClick = { selectedKelasId = null },
                            label = { Text("Semua Kelas (${allSiswaWithKelas.size})") }
                        )
                    }
                    items(allKelas) { k ->
                        FilterChip(
                            selected = selectedKelasId == k.id,
                            onClick = { selectedKelasId = k.id },
                            label = { Text("Kelas ${k.namaKelas}") }
                        )
                    }
                }
            }

            // Student List or Empty State
            if (filteredSiswa.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Default.School,
                            contentDescription = null,
                            tint = Color(0xFFCBD5E1),
                            modifier = Modifier.size(64.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "Belum ada data siswa.",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = Color(0xFF475569)
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = if (searchQuery.isNotEmpty()) "Tidak ada siswa yang sesuai pencarian." else "Mulai dengan menambahkan data siswa baru.",
                            fontSize = 12.sp,
                            color = Color(0xFF94A3B8)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = { showAddDialog = true },
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("+ Tambah Siswa")
                        }
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(filteredSiswa) { item ->
                        val saldo by viewModel.getSaldoFlow(item.siswa.id).collectAsState(initial = 0L)

                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { onNavigateDetailSiswa(item.siswa.id) },
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
                                    Surface(
                                        shape = RoundedCornerShape(12.dp),
                                        color = if (item.siswa.jenisKelamin == "P") Color(0xFFFFF1F2) else Color(0xFFEFF6FF),
                                        modifier = Modifier.size(40.dp)
                                    ) {
                                        Box(contentAlignment = Alignment.Center) {
                                            Text(
                                                text = item.siswa.namaSiswa.take(1).uppercase(),
                                                fontWeight = FontWeight.Bold,
                                                color = if (item.siswa.jenisKelamin == "P") Color(0xFFE11D48) else Color(0xFF1E40AF)
                                            )
                                        }
                                    }
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Column {
                                        Text(item.siswa.namaSiswa, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                        Text(
                                            text = "Kelas ${item.namaKelas ?: "-"} · NIS: ${item.siswa.nis.ifBlank { "-" }}",
                                            fontSize = 11.sp,
                                            color = Color(0xFF64748B)
                                        )
                                    }
                                }

                                Column(horizontalAlignment = Alignment.End) {
                                    Text(
                                        text = FormatHelper.formatRupiah(saldo),
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp,
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                    Text("Saldo", fontSize = 10.sp, color = Color(0xFF94A3B8))
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Dialog Tambah Siswa (Section 7)
    if (showAddDialog) {
        var nama by remember { mutableStateOf("") }
        var nis by remember { mutableStateOf("") }
        var kelasInput by remember { mutableStateOf(allKelas.firstOrNull()?.namaKelas ?: "5A") }
        var jenisKelamin by remember { mutableStateOf("L") }
        var nomorWa by remember { mutableStateOf("") }
        var errorMessage by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showAddDialog = false },
            title = { Text("Tambah Siswa Baru", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    if (errorMessage.isNotEmpty()) {
                        Text(errorMessage, color = MaterialTheme.colorScheme.error, fontSize = 12.sp)
                    }

                    OutlinedTextField(
                        value = nama,
                        onValueChange = { nama = it },
                        label = { Text("Nama Siswa *") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = nis,
                            onValueChange = { nis = it },
                            label = { Text("NIS") },
                            singleLine = true,
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = kelasInput,
                            onValueChange = { kelasInput = it },
                            label = { Text("Kelas *") },
                            singleLine = true,
                            modifier = Modifier.weight(1f)
                        )
                    }

                    // Jenis Kelamin
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        FilterChip(
                            selected = jenisKelamin == "L",
                            onClick = { jenisKelamin = "L" },
                            label = { Text("Laki-Laki") },
                            modifier = Modifier.weight(1f)
                        )
                        FilterChip(
                            selected = jenisKelamin == "P",
                            onClick = { jenisKelamin = "P" },
                            label = { Text("Perempuan") },
                            modifier = Modifier.weight(1f)
                        )
                    }

                    OutlinedTextField(
                        value = nomorWa,
                        onValueChange = { nomorWa = it },
                        label = { Text("Nomor WhatsApp (Opsional)") },
                        placeholder = { Text("0821...") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(onClick = {
                    viewModel.tambahSiswa(
                        nama = nama,
                        nis = nis,
                        kelasIdOrName = kelasInput,
                        isNewKelas = true,
                        jenisKelamin = jenisKelamin,
                        nomorWhatsApp = nomorWa,
                        onSuccess = { showAddDialog = false },
                        onError = { errorMessage = it }
                    )
                }) {
                    Text("Simpan")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddDialog = false }) {
                    Text("Batal")
                }
            }
        )
    }
}

package com.simsis.app.ui.screens

import android.content.Context
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.simsis.app.data.database.AppDatabase
import com.simsis.app.utils.BackupRestoreHelper
import com.simsis.app.viewmodel.SimSisViewModel
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PengaturanScreen(
    viewModel: SimSisViewModel,
    onNavigateBack: () -> Unit,
    onNavigateAbout: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val pengaturan by viewModel.pengaturan.collectAsState()

    var namaSekolah by remember(pengaturan) { mutableStateOf(pengaturan.namaSekolah) }
    var alamatSekolah by remember(pengaturan) { mutableStateOf(pengaturan.alamatSekolah) }
    var waliKelas by remember(pengaturan) { mutableStateOf(pengaturan.namaWaliKelas) }
    var tahunAjaran by remember(pengaturan) { mutableStateOf(pengaturan.tahunAjaran) }

    var showResetDialog by remember { mutableStateOf(false) }

    // File picker launcher for restore JSON (Section 19)
    val restoreFileLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri ->
        uri?.let {
            coroutineScope.launch {
                val db = AppDatabase.getDatabase(context)
                val success = BackupRestoreHelper.restoreFromJsonUri(context, it, db)
                if (success) {
                    Toast.makeText(context, "Data berhasil dipulihkan.", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(context, "File backup tidak valid.", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Pengaturan", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Kembali", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.primary)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Identitas Sekolah (Section 20)
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("IDENTITAS SEKOLAH", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF64748B))

                    OutlinedTextField(
                        value = namaSekolah,
                        onValueChange = { namaSekolah = it },
                        label = { Text("Nama Sekolah") },
                        placeholder = { Text("SD Negeri 1 Temanggung") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = alamatSekolah,
                        onValueChange = { alamatSekolah = it },
                        label = { Text("Alamat Sekolah") },
                        placeholder = { Text("Jl. Pahlawan No. 12, Temanggung") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = waliKelas,
                            onValueChange = { waliKelas = it },
                            label = { Text("Wali Kelas / Guru") },
                            placeholder = { Text("Budi Santoso, S.Pd.") },
                            singleLine = true,
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = tahunAjaran,
                            onValueChange = { tahunAjaran = it },
                            label = { Text("Tahun Ajaran") },
                            placeholder = { Text("2026/2027") },
                            singleLine = true,
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Button(
                        onClick = {
                            viewModel.simpanPengaturan(namaSekolah, alamatSekolah, waliKelas, tahunAjaran)
                            Toast.makeText(context, "Identitas sekolah berhasil disimpan.", Toast.LENGTH_SHORT).show()
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Simpan Identitas")
                    }
                }
            }

            // Backup & Restore Database (Section 18 & 19)
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("BACKUP & RESTORE DATA", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF64748B))

                    Text(
                        "Cadangkan seluruh data siswa dan riwayat transaksi ke berkas JSON atau pulihkan data dari file cadangan sebelumnya.",
                        fontSize = 12.sp,
                        color = Color(0xFF64748B)
                    )

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Button(
                            onClick = {
                                coroutineScope.launch {
                                    val db = AppDatabase.getDatabase(context)
                                    val backupFile = BackupRestoreHelper.createBackupJson(context, db)
                                    if (backupFile != null) {
                                        Toast.makeText(context, "Backup berhasil: ${backupFile.name}", Toast.LENGTH_LONG).show()
                                    } else {
                                        Toast.makeText(context, "Gagal membuat backup.", Toast.LENGTH_SHORT).show()
                                    }
                                }
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Backup JSON")
                        }

                        OutlinedButton(
                            onClick = {
                                restoreFileLauncher.launch(arrayOf("application/json", "*/*"))
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(Icons.Default.Upload, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Restore JSON")
                        }
                    }
                }
            }

            // Tentang SimSis Link (Section 21)
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onNavigateAbout() },
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp).fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Info, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text("Tentang SimSis", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text("Versi 1.0.0 · MSD Temanggung by Umar", fontSize = 11.sp, color = Color(0xFF64748B))
                        }
                    }
                    Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Color(0xFF94A3B8))
                }
            }

            // Danger Zone: Hapus Semua Data (Section 27)
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF1F2))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("ZONA BAHAYA", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFFE11D48))
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Semua data siswa dan transaksi akan dihapus secara permanen.", fontSize = 12.sp, color = Color(0xFF9F1239))
                    Spacer(modifier = Modifier.height(10.dp))
                    Button(
                        onClick = { showResetDialog = true },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE11D48)),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("Hapus Semua Data")
                    }
                }
            }
        }
    }

    // Reset Confirmation Dialog (Section 27)
    if (showResetDialog) {
        AlertDialog(
            onDismissRequest = { showResetDialog = false },
            title = { Text("PERINGATAN", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.error) },
            text = { Text("PERINGATAN: Semua data siswa dan transaksi akan dihapus dan tidak dapat dikembalikan.") },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.resetSemuaData {
                            showResetDialog = false
                            Toast.makeText(context, "Seluruh data telah dihapus.", Toast.LENGTH_SHORT).show()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Ya, Hapus Semua")
                }
            },
            dismissButton = {
                TextButton(onClick = { showResetDialog = false }) {
                    Text("Batal")
                }
            }
        )
    }
}

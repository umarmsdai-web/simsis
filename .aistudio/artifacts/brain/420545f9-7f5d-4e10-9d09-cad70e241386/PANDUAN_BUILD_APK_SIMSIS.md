# Panduan Lengkap Build APK: SimSis (Simpanan Siswa)

Dokumen ini berisi panduan langkah-demi-langkah untuk mengompilasi (*build*) source code **SimSis** menjadi berkas paket aplikasi Android (**APK**) yang siap dipasang (*install*) di perangkat Android guru, bendahara kelas, atau wali murid.

---

## 1. Lokasi & Struktur Proyek

Proyek ini telah dikonfigurasi sebagai **Android Native Application** murni:
* **Package Name**: `com.simsis.app`
* **Arsitektur**: Kotlin, Jetpack Compose, Material 3, Room Database, Coroutines, StateFlow, MVVM.
* **Target Android**: minSdk 24 (Android 7.0 Nougat) hingga targetSdk 35 (Android 15).
* **Kondisi Awal**: Database Room kosong bersih (*ready for production*).

---

## 2. Metode 1: Menggunakan Android Studio (Paling Mudah)

Metode ini adalah cara resmi dan paling direkomendasikan oleh Google:

### Langkah-langkah:
1. **Unduh & Buka Android Studio**:
   * Gunakan **Android Studio Ladybug (2024.2+)** atau versi lebih baru.
   * Pada layar pembuka Android Studio, pilih **Open** dan arahkan ke folder proyek ini (`SimSis/`).

2. **Sinkronisasi Gradle (Gradle Sync)**:
   * Tunggu hingga Android Studio selesai mengunduh *dependencies* dan menyelesaikan proses **Gradle Sync** (ditandai dengan munculnya tanda centang hijau di pojok kanan bawah).

3. **Build APK Debug**:
   * Pada menu atas Android Studio, klik:
     ```text
     Build  →  Build Bundle(s) / APK(s)  →  Build APK(s)
     ```
   * Tunggu proses kompilasi berjalan (sekitar 1–2 menit).

4. **Ambil Berkas APK**:
   * Setelah build selesai, akan muncul notifikasi pop-up di pojok kanan bawah:
     *"APK(s) generated successfully for 1 module"*.
   * Klik tautan **locate** pada notifikasi tersebut.
   * Berkas APK berada di folder:
     ```text
     app/build/outputs/apk/debug/app-debug.apk
     ```

---

## 3. Metode 2: Menggunakan Terminal / Command Line (Gradle)

Jika Anda menyukai terminal atau mengompilasi di server/laptop tanpa membuka GUI Android Studio:

### Prasyarat:
* Telah terpasang **JDK 17** atau **JDK 21** pada komputer Anda.
* Pastikan perintah `java -version` berjalan di terminal Anda.

### Perintah Build:

#### Di Linux / macOS:
```bash
# Berikan izin eksekusi pada wrapper
chmod +x gradlew

# Jalankan perintah kompilasi APK Debug
./gradlew assembleDebug
```

#### Di Windows (Command Prompt / PowerShell):
```cmd
gradlew.bat assembleDebug
```

### Hasil Build:
Berkas APK akan langsung tercipta di:
```text
app/build/outputs/apk/debug/app-debug.apk
```

---

## 4. Metode 3: Build Otomatis di Cloud (GitHub Actions)

Proyek ini sudah dilengkapi dengan alur kerja otomatis di berkas `.github/workflows/build-apk.yml`.

### Cara menggunakannya:
1. Simpan (*push*) proyek ini ke repositori **GitHub** Anda (publik maupun privat).
2. Masuk ke tab **Actions** di halaman repositori GitHub Anda.
3. Alur kerja **"Build SimSis Android APK"** akan otomatis berjalan.
4. Setelah selesai, buka hasil run tersebut dan unduh berkas **`SimSis-debug-apk.zip`** di bagian **Artifacts**.
5. Ekstrak ZIP tersebut untuk mendapatkan berkas `app-debug.apk`.

---

## 5. Metode 4: Membuat APK Release Siap Edar (Signed APK)

Untuk membuat APK versi produksi yang dioptimalkan dengan ProGuard/R8:

1. Di Android Studio, pilih menu:
   ```text
   Build  →  Generate Signed Bundle / APK...
   ```
2. Pilih opsi **APK**, lalu klik **Next**.
3. Buat atau pilih KeyStore Anda (Key store path, password, alias, key password).
4. Pilih build variant **release**, lalu centang **V1 (Jar Signature)** dan **V2 (Full APK Signature)**.
5. Klik **Create**. Berkas APK rilis Anda akan disimpan di:
   ```text
   app/release/app-release.apk
   ```

---

## 6. Cara Memasang (Install) APK di Handphone Android

1. Salin berkas `app-debug.apk` ke handphone (bisa lewat WhatsApp, Google Drive, kabel USB, atau email).
2. Ketuk berkas `app-debug.apk` di pengelola file handphone.
3. Jika muncul peringatan keamanan *"Untuk keamanan Anda, ponsel tidak diizinkan memasang aplikasi yang tidak dikenal dari sumber ini"*:
   * Ketuk **Setelan / Pengaturan**.
   * Aktifkan centang **Izinkan dari sumber ini**.
   * Ketuk tombol **Kembali** lalu ketuk **Instal**.
4. Aplikasi **SimSis (Simpanan Siswa)** dengan logo resmi MSD Temanggung by Umar akan terpasang di HP Anda dan langsung siap digunakan secara *offline* 100%.

---

## 7. Identitas Aplikasi & Pengembang

* **Nama Aplikasi**: SimSis
* **Subjudul**: Simpanan Siswa
* **Pengembang**: MSD Temanggung by Umar
* **Kontak Dukungan**: WhatsApp 082138950006
* **Hak Cipta**: © 2026 MSD Temanggung. All Rights Reserved.

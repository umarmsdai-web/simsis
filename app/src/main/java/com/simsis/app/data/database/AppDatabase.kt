package com.simsis.app.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.simsis.app.data.dao.KelasDao
import com.simsis.app.data.dao.PengaturanDao
import com.simsis.app.data.dao.SiswaDao
import com.simsis.app.data.dao.TransaksiDao
import com.simsis.app.data.entity.Kelas
import com.simsis.app.data.entity.Pengaturan
import com.simsis.app.data.entity.Siswa
import com.simsis.app.data.entity.Transaksi

@Database(
    entities = [
        Kelas::class,
        Siswa::class,
        Transaksi::class,
        Pengaturan::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun kelasDao(): KelasDao
    abstract fun siswaDao(): SiswaDao
    abstract fun transaksiDao(): TransaksiDao
    abstract fun pengaturanDao(): PengaturanDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "simsis_database"
                )
                // Database dimulai dalam keadaan bersih dan kosong sesuai kebutuhan pengguna
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}

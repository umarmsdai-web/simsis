package com.simsis.app

import android.app.Application
import com.simsis.app.data.database.AppDatabase
import com.simsis.app.data.repository.SimSisRepository

class SimSisApplication : Application() {

    val database by lazy { AppDatabase.getDatabase(this) }
    val repository by lazy {
        SimSisRepository(
            kelasDao = database.kelasDao(),
            siswaDao = database.siswaDao(),
            transaksiDao = database.transaksiDao(),
            pengaturanDao = database.pengaturanDao()
        )
    }
}

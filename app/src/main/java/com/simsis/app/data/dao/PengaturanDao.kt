package com.simsis.app.data.dao

import androidx.room.*
import com.simsis.app.data.entity.Pengaturan
import kotlinx.coroutines.flow.Flow

@Dao
interface PengaturanDao {
    @Query("SELECT * FROM pengaturan WHERE id = 1 LIMIT 1")
    fun getPengaturanFlow(): Flow<Pengaturan?>

    @Query("SELECT * FROM pengaturan WHERE id = 1 LIMIT 1")
    suspend fun getPengaturan(): Pengaturan?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(pengaturan: Pengaturan)

    @Query("DELETE FROM pengaturan")
    suspend fun deletePengaturan()
}

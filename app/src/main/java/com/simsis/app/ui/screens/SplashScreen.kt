package com.simsis.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Savings
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(onNavigateToDashboard: () -> Unit) {
    LaunchedEffect(Unit) {
        delay(1800)
        onNavigateToDashboard()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(Color(0xFF1E40AF), Color(0xFF1E3A8A), Color(0xFF0F172A))
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = Icons.Default.Savings,
                contentDescription = "Logo SimSis",
                tint = Color(0xFFFBBF24),
                modifier = Modifier.size(88.dp)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "SimSis",
                fontSize = 34.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color.White,
                letterSpacing = 1.sp
            )
            Text(
                text = "Simpanan Siswa",
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFFDBEAFE)
            )

            Spacer(modifier = Modifier.height(64.dp))
            Text(
                text = "MSD Temanggung",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFE2E8F0)
            )
            Text(
                text = "by Umar",
                fontSize = 12.sp,
                color = Color(0xFF94A3B8)
            )
        }
    }
}

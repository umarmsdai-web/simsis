package com.simsis.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.simsis.app.ui.navigation.SimSisNavGraph
import com.simsis.app.ui.theme.SimSisTheme
import com.simsis.app.viewmodel.SimSisViewModel
import com.simsis.app.viewmodel.ViewModelFactory

class MainActivity : ComponentActivity() {

    private val viewModel: SimSisViewModel by viewModels {
        val app = application as SimSisApplication
        ViewModelFactory(app.repository)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SimSisTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    SimSisNavGraph(
                        navController = navController,
                        viewModel = viewModel
                    )
                }
            }
        }
    }
}

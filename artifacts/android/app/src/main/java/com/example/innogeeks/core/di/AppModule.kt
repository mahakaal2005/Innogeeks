package com.example.innogeeks.core.di

import com.example.innogeeks.core.datastore.SessionStore
import com.example.innogeeks.feature.auth.AuthViewModel
import com.example.innogeeks.feature.auth.AuthRepository
import com.example.innogeeks.core.network.Network
import com.example.innogeeks.feature.home.HomeViewModel
import com.example.innogeeks.feature.splash.SplashViewModel
import org.koin.android.ext.koin.androidContext
import org.koin.androidx.viewmodel.dsl.viewModel
import org.koin.dsl.module

val appModule = module {
    single { SessionStore(androidContext()) }

    single { Network.supabaseAuthApi(get()) }
    single { Network.supabaseRestApi(get()) }

    single { AuthRepository(get(), get(), get()) }
    
    viewModel { SplashViewModel(get()) }
    viewModel { AuthViewModel(get()) }
    viewModel { HomeViewModel(get()) }
}

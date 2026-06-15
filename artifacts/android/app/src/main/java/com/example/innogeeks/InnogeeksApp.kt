package com.example.innogeeks

import android.app.Application
import com.example.innogeeks.core.di.AppContainer
import kotlinx.coroutines.runBlocking

/**
 * Application entry point. Owns the manual DI container.
 */
class InnogeeksApp : Application() {

    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
        // Warm the cached auth token so network interceptors can attach it synchronously.
        runBlocking { container.sessionStore.preload() }
    }
}

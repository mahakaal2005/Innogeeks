package com.example.innogeeks.core.di

import android.content.Context
import com.example.innogeeks.core.datastore.SessionStore
import com.example.innogeeks.core.network.Network
import com.example.innogeeks.feature.auth.AuthRepository

/** Lightweight manual dependency container, owned by the Application. */
class AppContainer(context: Context) {

    val sessionStore = SessionStore(context.applicationContext)

    private val authApi by lazy { Network.supabaseAuthApi(sessionStore) }
    private val restApi by lazy { Network.supabaseRestApi(sessionStore) }

    val authRepository by lazy { AuthRepository(authApi, restApi, sessionStore) }
}

package com.example.innogeeks.core.datastore

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.example.innogeeks.core.network.AuthResponse
import com.example.innogeeks.core.network.ProfileDto
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "innogeeks_session")

data class Session(
    val accessToken: String,
    val refreshToken: String,
    val userId: String,
    val email: String,
    val name: String,
    val role: String,
    val domain: String?,
    val year: Int?,
)

/**
 * Persists the signed-in session. Also keeps an in-memory copy of the access token
 * so the OkHttp interceptor can attach it synchronously.
 */
class SessionStore(private val context: Context) {

    @Volatile
    var cachedAccessToken: String? = null
        private set

    private object Keys {
        val ACCESS = stringPreferencesKey("access_token")
        val REFRESH = stringPreferencesKey("refresh_token")
        val USER_ID = stringPreferencesKey("user_id")
        val EMAIL = stringPreferencesKey("email")
        val NAME = stringPreferencesKey("name")
        val ROLE = stringPreferencesKey("role")
        val DOMAIN = stringPreferencesKey("domain")
        val YEAR = intPreferencesKey("year")
    }

    val sessionFlow: Flow<Session?> = context.dataStore.data.map { prefs ->
        val access = prefs[Keys.ACCESS] ?: return@map null
        Session(
            accessToken = access,
            refreshToken = prefs[Keys.REFRESH] ?: "",
            userId = prefs[Keys.USER_ID] ?: "",
            email = prefs[Keys.EMAIL] ?: "",
            name = prefs[Keys.NAME] ?: "",
            role = prefs[Keys.ROLE] ?: "public",
            domain = prefs[Keys.DOMAIN],
            year = prefs[Keys.YEAR],
        )
    }

    suspend fun preload() {
        cachedAccessToken = context.dataStore.data.first()[Keys.ACCESS]
    }

    /**
     * Caches the access token in memory so the OkHttp interceptor can attach it
     * before the full session is persisted via [save]. Needed during sign-in:
     * the profile lookup runs before the session exists, so without a cached
     * token the request goes out as anon and RLS hides the profile row.
     */
    fun cacheToken(token: String?) {
        cachedAccessToken = token
    }

    /** Lightweight update — persists only the new access+refresh tokens after a silent refresh. */
    suspend fun saveTokens(accessToken: String, refreshToken: String) {
        context.dataStore.edit { prefs ->
            prefs[Keys.ACCESS] = accessToken
            prefs[Keys.REFRESH] = refreshToken
        }
        cachedAccessToken = accessToken
    }

    suspend fun save(auth: AuthResponse, profile: ProfileDto) {
        context.dataStore.edit { prefs ->
            prefs[Keys.ACCESS] = auth.accessToken
            prefs[Keys.REFRESH] = auth.refreshToken
            prefs[Keys.USER_ID] = profile.id
            prefs[Keys.EMAIL] = profile.email
            prefs[Keys.NAME] = profile.name
            prefs[Keys.ROLE] = profile.role
            if (profile.domain != null) prefs[Keys.DOMAIN] = profile.domain else prefs.remove(Keys.DOMAIN)
            if (profile.year != null) prefs[Keys.YEAR] = profile.year else prefs.remove(Keys.YEAR)
        }
        cachedAccessToken = auth.accessToken
    }

    suspend fun clear() {
        context.dataStore.edit { it.clear() }
        cachedAccessToken = null
    }
}

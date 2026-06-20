package com.example.innogeeks.core.network

import com.example.innogeeks.BuildConfig
import com.example.innogeeks.core.datastore.SessionStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

/** Builds OkHttp + Retrofit clients for the Supabase endpoints. */
object Network {

    private fun supabaseClient(sessionStore: SessionStore): OkHttpClient {
        val anon = BuildConfig.SUPABASE_ANON_KEY
        val logging = HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BODY else HttpLoggingInterceptor.Level.NONE
        }

        // A minimal Retrofit instance used ONLY for token refresh (no interceptor to avoid recursion)
        val refreshRetrofit = Retrofit.Builder()
            .baseUrl(ensureSlash(BuildConfig.SUPABASE_URL))
            .client(
                OkHttpClient.Builder()
                    .addInterceptor { chain ->
                        chain.proceed(
                            chain.request().newBuilder()
                                .addHeader("apikey", anon)
                                .build()
                        )
                    }
                    .build()
            )
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        val refreshApi = refreshRetrofit.create(SupabaseAuthApi::class.java)

        return OkHttpClient.Builder()
            .addInterceptor { chain ->
                val token = sessionStore.cachedAccessToken
                val request = chain.request().newBuilder()
                    .addHeader("apikey", anon)
                    .addHeader("Authorization", "Bearer ${token ?: anon}")
                    .build()

                val response = chain.proceed(request)

                // On 401: try to refresh token once, then retry the original request
                if (response.code == 401) {
                    response.close()

                    val refreshToken = runBlocking {
                        sessionStore.sessionFlow.first()?.refreshToken
                    }

                    if (!refreshToken.isNullOrBlank()) {
                        return@addInterceptor try {
                            val newAuth = runBlocking {
                                refreshApi.refreshToken(body = RefreshRequest(refreshToken))
                            }
                            // Persist the new tokens
                            runBlocking {
                                sessionStore.saveTokens(newAuth.accessToken, newAuth.refreshToken)
                            }

                            // Retry the original request with the new token
                            chain.proceed(
                                chain.request().newBuilder()
                                    .addHeader("apikey", anon)
                                    .addHeader("Authorization", "Bearer ${newAuth.accessToken}")
                                    .build()
                            )
                        } catch (e: Exception) {
                            // Refresh failed — clear session so user is sent to login
                            runBlocking { sessionStore.clear() }
                            response
                        }
                    } else {
                        // No refresh token — clear session
                        runBlocking { sessionStore.clear() }
                    }
                }

                response
            }
            .addInterceptor(logging)
            .build()
    }

    private fun retrofit(baseUrl: String, client: OkHttpClient): Retrofit =
        Retrofit.Builder()
            .baseUrl(ensureSlash(baseUrl))
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

    fun supabaseAuthApi(sessionStore: SessionStore): SupabaseAuthApi =
        retrofit(BuildConfig.SUPABASE_URL, supabaseClient(sessionStore)).create(SupabaseAuthApi::class.java)

    fun supabaseRestApi(sessionStore: SessionStore): SupabaseRestApi =
        retrofit(BuildConfig.SUPABASE_URL, supabaseClient(sessionStore)).create(SupabaseRestApi::class.java)

    private fun ensureSlash(url: String): String = if (url.endsWith("/")) url else "$url/"
}

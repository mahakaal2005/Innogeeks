package com.example.innogeeks.core.network

import com.example.innogeeks.BuildConfig
import com.example.innogeeks.core.datastore.SessionStore
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

/** Builds OkHttp + Retrofit clients for the Supabase endpoints. */
object Network {

    private fun supabaseClient(sessionStore: SessionStore): OkHttpClient {
        val anon = BuildConfig.SUPABASE_ANON_KEY
        val logging = HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BASIC else HttpLoggingInterceptor.Level.NONE
        }
        return OkHttpClient.Builder()
            .addInterceptor { chain ->
                val token = sessionStore.cachedAccessToken
                val request = chain.request().newBuilder()
                    .addHeader("apikey", anon)
                    .addHeader("Authorization", "Bearer ${token ?: anon}")
                    .build()
                chain.proceed(request)
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

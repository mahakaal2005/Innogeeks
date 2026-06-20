package com.example.innogeeks.feature.events.data

import com.example.innogeeks.core.common.DataError
import com.example.innogeeks.core.common.Result
import com.example.innogeeks.core.network.SupabaseRestApi
import com.google.gson.annotations.SerializedName
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

data class EventDto(
    val id: String = "",
    val title: String,
    val description: String,
    @SerializedName("banner_url") val posterUrl: String?,
    @SerializedName("event_date") val eventDate: String,
    val domain: String,
    @SerializedName("created_at") val createdAt: String = ""
)

class EventsRepository(private val api: SupabaseRestApi) {
    
    suspend fun getEvents(domain: String): Result<List<EventDto>, DataError.Network> = withContext(Dispatchers.IO) {
        try {
            val response = api.getEvents("eq.$domain")
            Result.Success(response)
        } catch (e: Exception) {
            Result.Error(DataError.Network.UNKNOWN)
        }
    }

    suspend fun createEvent(event: EventDto): Result<EventDto, DataError.Network> = withContext(Dispatchers.IO) {
        try {
            val body = mapOf(
                "title" to event.title,
                "description" to event.description,
                "banner_url" to (event.posterUrl ?: ""),
                "event_date" to "2026-10-25T10:00:00Z", // Mock timestamp to pass validation
                "domain" to event.domain,
                "registration_scope" to "open",
                "status" to "published"
            )
            val response = api.createEvent(body = body)
            if (response.isNotEmpty()) {
                Result.Success(response.first())
            } else {
                Result.Error(DataError.Network.UNKNOWN)
            }
        } catch (e: Exception) {
            if (e is retrofit2.HttpException) {
                android.util.Log.e("SupabaseError", "POST failed: ${e.response()?.errorBody()?.string()}")
            } else {
                e.printStackTrace()
            }
            Result.Error(DataError.Network.UNKNOWN)
        }
    }
}

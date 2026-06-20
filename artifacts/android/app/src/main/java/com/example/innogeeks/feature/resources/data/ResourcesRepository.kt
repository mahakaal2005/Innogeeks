package com.example.innogeeks.feature.resources.data

import com.example.innogeeks.core.common.DataError
import com.example.innogeeks.core.common.Result
import com.example.innogeeks.core.network.SupabaseRestApi
import com.google.gson.annotations.SerializedName
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

data class ResourceDto(
    val id: String = "",
    val title: String,
    @SerializedName("type") val resourceType: String,
    val category: String,
    val url: String,
    val domain: String,
    @SerializedName("created_at") val createdAt: String = ""
)

class ResourcesRepository(private val api: SupabaseRestApi) {
    
    suspend fun getResources(domain: String): Result<List<ResourceDto>, DataError.Network> = withContext(Dispatchers.IO) {
        try {
            val response = api.getResources("eq.$domain")
            Result.Success(response)
        } catch (e: Exception) {
            Result.Error(DataError.Network.UNKNOWN)
        }
    }

    suspend fun createResource(resource: ResourceDto): Result<ResourceDto, DataError.Network> = withContext(Dispatchers.IO) {
        try {
            val body = mapOf(
                "title" to resource.title,
                "type" to resource.resourceType,
                "category" to resource.category,
                "url" to resource.url,
                "domain" to resource.domain
            )
            val response = api.createResource(body = body)
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

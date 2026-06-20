package com.example.innogeeks.core.network

import android.content.Context
import android.net.Uri
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.asRequestBody
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream

class CloudinaryService(private val context: Context) {
    private val client = OkHttpClient()
    private val cloudName = "djqboxjw7"

    /**
     * Uploads a file to Cloudinary using the unsigned preset via direct REST API call.
     * Bypasses the official SDK to avoid 16KB native library alignment issues (Fresco).
     */
    fun uploadImage(imageUri: Uri, presetName: String = "innogeeks_events"): Flow<Result<String>> = flow {
        try {
            // Copy Uri to temp file to upload
            val inputStream = context.contentResolver.openInputStream(imageUri) ?: throw Exception("Cannot open URI")
            val tempFile = File(context.cacheDir, "upload_temp_${System.currentTimeMillis()}")
            val outputStream = FileOutputStream(tempFile)
            inputStream.copyTo(outputStream)
            inputStream.close()
            outputStream.close()

            val requestBody = MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("upload_preset", presetName)
                .addFormDataPart("file", tempFile.name, tempFile.asRequestBody("application/octet-stream".toMediaTypeOrNull()))
                .build()

            val request = Request.Builder()
                .url("https://api.cloudinary.com/v1_1/$cloudName/auto/upload")
                .post(requestBody)
                .build()

            val response = client.newCall(request).execute()
            tempFile.delete()

            if (response.isSuccessful) {
                val responseBody = response.body?.string() ?: ""
                val json = JSONObject(responseBody)
                val secureUrl = json.getString("secure_url")
                emit(Result.success(secureUrl))
            } else {
                emit(Result.failure(Exception("Cloudinary Upload Error: ${response.code} ${response.message}")))
            }
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }.flowOn(Dispatchers.IO)
}

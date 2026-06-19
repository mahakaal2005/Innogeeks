package com.example.innogeeks.feature.attendance.data

import com.example.innogeeks.core.common.Result
import com.example.innogeeks.feature.attendance.data.dto.CreateSessionRequest
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertTrue
import org.junit.Test

class AttendanceRepositoryTest {
    @Test
    fun testFakeRepository() = runBlocking {
        val repo = FakeAttendanceRepository()
        val result = repo.createSession(CreateSessionRequest("android", "Week 1"))
        assertTrue(result is Result.Success)
    }
}

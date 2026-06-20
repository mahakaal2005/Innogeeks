package com.example.innogeeks.feature.attendance.data

import com.example.innogeeks.core.common.Result
import com.example.innogeeks.feature.attendance.data.dto.CreateSessionRequest
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class AttendanceRepositoryTest {
    @Test
    fun testFakeRepository() = runTest {
        val repo = FakeAttendanceRepository()
        val result = repo.createSession(CreateSessionRequest("android", "Week 1", "2026-06-21"))
        assertTrue(result is Result.Success)
        
        val session = (result as Result.Success).data
        assertEquals("Week 1", session.title)
        
        val sessionsResult = repo.getSessions("android")
        assertTrue(sessionsResult is Result.Success)
        
        val sessions = (sessionsResult as Result.Success).data
        assertEquals(1, sessions.size)
        assertEquals(session.id, sessions[0].id)
    }
}

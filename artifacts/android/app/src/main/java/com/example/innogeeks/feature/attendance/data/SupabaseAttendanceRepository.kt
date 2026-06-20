package com.example.innogeeks.feature.attendance.data

import com.example.innogeeks.core.common.DataError
import com.example.innogeeks.core.common.Result
import com.example.innogeeks.core.network.SupabaseRestApi
import com.example.innogeeks.feature.attendance.data.dto.AttendanceSession
import com.example.innogeeks.feature.attendance.data.dto.BulkAttendanceRequest
import com.example.innogeeks.feature.attendance.data.dto.CreateSessionRequest
import com.example.innogeeks.feature.attendance.data.dto.DomainMember

class SupabaseAttendanceRepository(
    private val restApi: SupabaseRestApi
) : AttendanceRepository {

    override suspend fun getSessions(domain: String): Result<List<AttendanceSession>, DataError.Network> {
        return try {
            // Fetch sessions
            val sessions = restApi.getAttendanceSessions(domainFilter = "eq.$domain")
            // For each session, fetch its attendance records to compute counts
            val enriched = sessions.map { session ->
                try {
                    val records = restApi.getAttendanceRecords("eq.${session.id}")
                    val total = records.size
                    val present = records.count { it["is_present"] == true }
                    session.copy(presentCount = present, totalCount = total)
                } catch (e: Exception) {
                    session // return session as-is if count fetch fails
                }
            }
            Result.Success(enriched)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.Error(DataError.Network.UNKNOWN)
        }
    }

    override suspend fun getRoster(sessionId: String): Result<List<DomainMember>, DataError.Network> {
        return try {
            val sessionList = restApi.getAttendanceSessionById("eq.$sessionId")
            if (sessionList.isEmpty()) return Result.Error(DataError.Network.UNKNOWN)
            val session = sessionList.first()

            val members = restApi.getMembersByDomain("eq.${session.domain}")
            val records = restApi.getAttendanceRecords("eq.$sessionId")

            val presentUserIds = records.filter { it["is_present"] == true }.map { it["user_id"].toString() }.toSet()

            val roster = members.map { member ->
                member.copy(isPresent = presentUserIds.contains(member.userId))
            }
            Result.Success(roster)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.Error(DataError.Network.UNKNOWN)
        }
    }

    override suspend fun createSession(req: CreateSessionRequest): Result<AttendanceSession, DataError.Network> {
        return try {
            val body = mapOf(
                "domain" to req.domain,
                "title" to req.title,
                "session_date" to req.sessionDate
            )
            val response = restApi.createAttendanceSession(body = body)
            if (response.isNotEmpty()) {
                Result.Success(response.first())
            } else {
                Result.Error(DataError.Network.UNKNOWN)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            Result.Error(DataError.Network.UNKNOWN)
        }
    }

    override suspend fun updateAttendance(sessionId: String, req: BulkAttendanceRequest): Result<Unit, DataError.Network> {
        return try {
            val presentSet = req.presentUserIds.toSet()
            val records = req.allUserIds.map { userId ->
                com.example.innogeeks.feature.attendance.data.dto.AttendanceRecord(
                    sessionId = sessionId,
                    userId = userId,
                    isPresent = presentSet.contains(userId)
                )
            }
            if (records.isNotEmpty()) {
                restApi.bulkUpsertAttendance(records = records)
            }
            Result.Success(Unit)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.Error(DataError.Network.UNKNOWN)
        }
    }
}

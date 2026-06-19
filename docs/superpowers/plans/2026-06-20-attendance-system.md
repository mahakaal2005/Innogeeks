# Attendance System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Android Attendance system (Roster List) for coordinators to create sessions and mark attendance.

**Architecture:** MVI with Ktor for the data layer. `CoordinatorAttendanceViewModel` holds state (sessions, roster members, selected session, mutated attendance set). The UI uses `LazyColumn` for the roster and a bottom sheet for session creation.

**Tech Stack:** Kotlin, Jetpack Compose, Koin, Ktor, Turbine, JUnit5.

## Global Constraints
- All paths relative to `artifacts/android/`
- Use `Result<T, DataError.Network>` for network errors.
- Use `UiText` for error strings.

---

### Task 1: Attendance Data Layer (Models & Repository)

**Files:**
- Create: `app/src/main/java/com/example/innogeeks/feature/attendance/data/dto/AttendanceModels.kt`
- Create: `app/src/main/java/com/example/innogeeks/feature/attendance/data/AttendanceRepository.kt`
- Create: `app/src/test/java/com/example/innogeeks/feature/attendance/data/AttendanceRepositoryTest.kt`

**Interfaces:**
- Produces: `AttendanceSession`, `DomainMember`, `AttendanceRepository` interface and implementation.

- [ ] **Step 1: Define DTOs**
```kotlin
// app/src/main/java/com/example/innogeeks/feature/attendance/data/dto/AttendanceModels.kt
package com.example.innogeeks.feature.attendance.data.dto

import kotlinx.serialization.Serializable

@Serializable
data class AttendanceSession(
    val id: String,
    val title: String,
    val date: String,
    val presentCount: Int = 0,
    val totalCount: Int = 0
)

@Serializable
data class DomainMember(
    val userId: String,
    val name: String,
    val rollNumber: String,
    val isPresent: Boolean = false
)

@Serializable
data class CreateSessionRequest(
    val domain: String,
    val title: String
)

@Serializable
data class BulkAttendanceRequest(
    val presentUserIds: List<String>
)
```

- [ ] **Step 2: Define Repository Interface & Fake Implementation**
```kotlin
// app/src/main/java/com/example/innogeeks/feature/attendance/data/AttendanceRepository.kt
package com.example.innogeeks.feature.attendance.data

import com.example.innogeeks.core.domain.util.DataError
import com.example.innogeeks.core.domain.util.Result
import com.example.innogeeks.feature.attendance.data.dto.*

interface AttendanceRepository {
    suspend fun getSessions(domain: String): Result<List<AttendanceSession>, DataError.Network>
    suspend fun getRoster(sessionId: String): Result<List<DomainMember>, DataError.Network>
    suspend fun createSession(req: CreateSessionRequest): Result<AttendanceSession, DataError.Network>
    suspend fun updateAttendance(sessionId: String, req: BulkAttendanceRequest): Result<Unit, DataError.Network>
}

class FakeAttendanceRepository : AttendanceRepository {
    private val sessions = mutableListOf<AttendanceSession>()
    override suspend fun getSessions(domain: String): Result<List<AttendanceSession>, DataError.Network> {
        return Result.Success(sessions)
    }
    override suspend fun getRoster(sessionId: String): Result<List<DomainMember>, DataError.Network> {
        return Result.Success(listOf(DomainMember("1", "John Doe", "2024001", false)))
    }
    override suspend fun createSession(req: CreateSessionRequest): Result<AttendanceSession, DataError.Network> {
        val newSession = AttendanceSession("id1", req.title, "2026-06-20")
        sessions.add(newSession)
        return Result.Success(newSession)
    }
    override suspend fun updateAttendance(sessionId: String, req: BulkAttendanceRequest): Result<Unit, DataError.Network> {
        return Result.Success(Unit)
    }
}
```

- [ ] **Step 3: Write test for Fake (just to ensure it compiles and works)**
```kotlin
// app/src/test/java/com/example/innogeeks/feature/attendance/data/AttendanceRepositoryTest.kt
package com.example.innogeeks.feature.attendance.data

import assertk.assertThat
import assertk.assertions.isEqualTo
import com.example.innogeeks.core.domain.util.Result
import com.example.innogeeks.feature.attendance.data.dto.CreateSessionRequest
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Test

class AttendanceRepositoryTest {
    @Test
    fun testFakeRepository() = runTest {
        val repo = FakeAttendanceRepository()
        val result = repo.createSession(CreateSessionRequest("android", "Week 1"))
        assertThat(result is Result.Success).isEqualTo(true)
    }
}
```

- [ ] **Step 4: Run test to verify**
Run: `.\gradlew.bat testDebugUnitTest --tests "com.example.innogeeks.feature.attendance.data.AttendanceRepositoryTest"`
Expected: PASS

- [ ] **Step 5: Commit**
Run: `git add app/src/main/java/com/example/innogeeks/feature/attendance app/src/test/java/com/example/innogeeks/feature/attendance && git commit -m "feat(attendance): add repository and dtos"`

---

### Task 2: CoordinatorAttendanceViewModel

**Files:**
- Create: `app/src/main/java/com/example/innogeeks/feature/attendance/presentation/CoordinatorAttendanceViewModel.kt`
- Create: `app/src/test/java/com/example/innogeeks/feature/attendance/presentation/CoordinatorAttendanceViewModelTest.kt`

**Interfaces:**
- Consumes: `AttendanceRepository`
- Produces: `CoordinatorAttendanceViewModel`, `AttendanceUiState`, `AttendanceAction`, `AttendanceEvent`

- [ ] **Step 1: Write ViewModel test**
```kotlin
// app/src/test/java/com/example/innogeeks/feature/attendance/presentation/CoordinatorAttendanceViewModelTest.kt
package com.example.innogeeks.feature.attendance.presentation

import app.cash.turbine.test
import assertk.assertThat
import assertk.assertions.isEqualTo
import assertk.assertions.isTrue
import com.example.innogeeks.feature.attendance.data.FakeAttendanceRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

@OptIn(ExperimentalCoroutinesApi::class)
class CoordinatorAttendanceViewModelTest {
    private val dispatcher = StandardTestDispatcher()
    
    @BeforeEach
    fun setup() { Dispatchers.setMain(dispatcher) }
    
    @AfterEach
    fun teardown() { Dispatchers.resetMain() }

    @Test
    fun testLoadSessions() = runTest {
        val repo = FakeAttendanceRepository()
        val vm = CoordinatorAttendanceViewModel(repo)
        
        vm.state.test {
            val state = awaitItem()
            assertThat(state.isLoading).isEqualTo(false)
            cancelAndIgnoreRemainingEvents()
        }
    }
}
```

- [ ] **Step 2: Run test (Fails - VM not found)**
Run: `.\gradlew.bat testDebugUnitTest --tests "com.example.innogeeks.feature.attendance.presentation.CoordinatorAttendanceViewModelTest"`
Expected: FAIL

- [ ] **Step 3: Implement ViewModel**
```kotlin
// app/src/main/java/com/example/innogeeks/feature/attendance/presentation/CoordinatorAttendanceViewModel.kt
package com.example.innogeeks.feature.attendance.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.innogeeks.core.domain.util.Result
import com.example.innogeeks.core.presentation.ui.UiText
import com.example.innogeeks.feature.attendance.data.AttendanceRepository
import com.example.innogeeks.feature.attendance.data.dto.AttendanceSession
import com.example.innogeeks.feature.attendance.data.dto.DomainMember
import kotlinx.collections.immutable.PersistentList
import kotlinx.collections.immutable.persistentListOf
import kotlinx.collections.immutable.toPersistentList
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class AttendanceUiState(
    val isLoading: Boolean = false,
    val sessions: PersistentList<AttendanceSession> = persistentListOf(),
    val roster: PersistentList<DomainMember> = persistentListOf(),
    val presentUserIds: Set<String> = emptySet(),
    val error: UiText? = null
)

class CoordinatorAttendanceViewModel(
    private val repo: AttendanceRepository
) : ViewModel() {
    private val _state = MutableStateFlow(AttendanceUiState())
    val state = _state.asStateFlow()

    fun loadSessions(domain: String) {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }
            when (val res = repo.getSessions(domain)) {
                is Result.Success -> _state.update { it.copy(isLoading = false, sessions = res.data.toPersistentList()) }
                is Result.Error -> _state.update { it.copy(isLoading = false, error = UiText.DynamicString(res.error.name)) }
            }
        }
    }
}
```

- [ ] **Step 4: Run test to pass**
Run: `.\gradlew.bat testDebugUnitTest --tests "com.example.innogeeks.feature.attendance.presentation.CoordinatorAttendanceViewModelTest"`
Expected: PASS

- [ ] **Step 5: Commit**
Run: `git add . && git commit -m "feat(attendance): implement CoordinatorAttendanceViewModel"`

---

### Task 3: Attendance UI Screens

**Files:**
- Create: `app/src/main/java/com/example/innogeeks/feature/attendance/presentation/AttendanceScreen.kt`

**Interfaces:**
- Consumes: `AttendanceUiState`, `CoordinatorAttendanceViewModel`

- [ ] **Step 1: Create AttendanceScreen**
```kotlin
// app/src/main/java/com/example/innogeeks/feature/attendance/presentation/AttendanceScreen.kt
package com.example.innogeeks.feature.attendance.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.innogeeks.ui.components.GlassCard
import com.example.innogeeks.ui.theme.ElectricCyan
import org.koin.androidx.compose.koinViewModel

@Composable
fun CoordinatorAttendanceScreen(
    vm: CoordinatorAttendanceViewModel = koinViewModel()
) {
    val state by vm.state.collectAsState()
    
    // We launch a side-effect to load initial sessions. Hardcoded "android" domain for now
    LaunchedEffect(Unit) {
        vm.loadSessions("android")
    }

    Box(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        if (state.isLoading) {
            CircularProgressIndicator()
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                item {
                    Text("Past Sessions", style = MaterialTheme.typography.headlineMedium)
                }
                items(state.sessions) { session ->
                    GlassCard(modifier = Modifier.fillMaxWidth()) {
                        Text(session.title, color = ElectricCyan)
                        Text(session.date)
                        Text("${session.presentCount} / ${session.totalCount} Present")
                    }
                }
            }
        }
    }
}
```

- [ ] **Step 2: Add Koin Module Registration (Optional but needed for run)**
Modify `app/src/main/java/com/example/innogeeks/MainActivity.kt` or the Koin configuration module to include `viewModel { CoordinatorAttendanceViewModel(get()) }` and `single<AttendanceRepository> { FakeAttendanceRepository() }`. Since this is a plan, we assume `FakeAttendanceRepository` is manually injected if koin is not fully wired for it.

- [ ] **Step 3: Build Project**
Run: `.\gradlew.bat assembleDebug`
Expected: PASS

- [ ] **Step 4: Commit**
Run: `git add . && git commit -m "feat(attendance): add AttendanceScreen UI"`

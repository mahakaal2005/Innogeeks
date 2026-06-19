---
name: android-presentation-mvvm
description: |
  MVVM presentation layer for Android/KMP - State, Action functions, Event, ViewModel, Root/Screen composable split, UI models, UiText error mapping, and process death with SavedStateHandle. Use this skill whenever creating or reviewing a ViewModel, defining screen state or events, structuring composables, mapping errors to UI strings, or handling process death. Trigger on phrases like "add a ViewModel", "create a screen", "MVVM", "state", "event", "screen composable", "UiText", "SavedStateHandle", "ObserveAsEvents", or "UI model".
---

# Android / KMP Presentation Layer (MVVM)

## Overview

Every screen has:
1. **State** — a single data class holding all UI state fields.
2. **ViewModel** — holds `StateFlow<State>`, exposes public functions for user actions, emits `Event` via `Channel`.
3. **Event** — a sealed interface of one-time side effects (navigation, snackbar).

---

## State

```kotlin
data class NoteListState(
    val notes: List<NoteUi> = emptyList(),
    val isLoading: Boolean = false,
    val error: UiText? = null
)
```

Always update state with `.update { }` — never replace the entire flow:
```kotlin
_state.update { it.copy(isLoading = true) }
```

---

## Event (one-time side effects)

```kotlin
sealed interface NoteListEvent {
    data class NavigateToDetail(val noteId: String) : NoteListEvent
    data class ShowSnackbar(val message: UiText) : NoteListEvent
}
```

---

## ViewModel

```kotlin
class NoteListViewModel(
    private val noteRepository: NoteRepository
) : ViewModel() {

    private val _state = MutableStateFlow(NoteListState())
    val state = _state.asStateFlow()

    private val _events = Channel<NoteListEvent>()
    val events = _events.receiveAsFlow()

    fun onRefreshClick() {
        loadNotes()
    }

    fun onNoteClick(noteId: String) {
        viewModelScope.launch {
            _events.send(NoteListEvent.NavigateToDetail(noteId))
        }
    }

    private fun loadNotes() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }
            noteRepository.getNotes()
                .onSuccess { notes ->
                    _state.update { it.copy(notes = notes.map { it.toNoteUi() }, isLoading = false) }
                }
                .onFailure { error ->
                    _state.update { it.copy(isLoading = false) }
                    _events.send(NoteListEvent.ShowSnackbar(error.toUiText()))
                }
        }
    }
}
```

---

## Mapping Errors to UI Strings

`UiText` wraps strings that originate from — or could originate from — a string resource:

```kotlin
sealed interface UiText {
    data class DynamicString(val value: String) : UiText
    class StringResource(val id: Int, val args: Array<Any> = emptyArray()) : UiText
}
```

**When to use `UiText`:** For any string that comes from a string resource, could be localized, or might be either a resource or a dynamic value depending on context.

---

## Composable Structure

Both the Root and Screen composable live in the **same file** (e.g., `NoteListScreen.kt`).

### Root Composable (suffixed `Root`)

Receives the ViewModel (via `koinViewModel()`) and any callbacks needed for navigation. Observes events. Passes state and action callbacks down.

### Screen Composable (suffixed `Screen`)

Receives only `state` and individual event callbacks. No ViewModel reference. Can be previewed independently.

```kotlin
// NoteListScreen.kt — Root + Screen in a single file

@Composable
fun NoteListRoot(
    onNavigateToDetail: (String) -> Unit,
    viewModel: NoteListViewModel = koinViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    ObserveAsEvents(viewModel.events) { event ->
        when (event) {
            is NoteListEvent.NavigateToDetail -> onNavigateToDetail(event.noteId)
            is NoteListEvent.ShowSnackbar -> { /* show snackbar */ }
        }
    }

    NoteListScreen(
        state = state,
        onRefreshClick = viewModel::onRefreshClick,
        onNoteClick = viewModel::onNoteClick
    )
}

@Composable
fun NoteListScreen(
    state: NoteListState,
    onRefreshClick: () -> Unit,
    onNoteClick: (String) -> Unit
) { ... }

@Preview
@Composable
private fun NoteListScreenPreview() {
    NoteListScreen(state = NoteListState(), onRefreshClick = {}, onNoteClick = {})
}
```

---

## Process Death

When a screen involves complex forms or critical user input, restore essential fields using `SavedStateHandle`:

```kotlin
class NoteEditorViewModel(
    private val savedStateHandle: SavedStateHandle,
    private val noteRepository: NoteRepository
) : ViewModel() {
    private val _state = MutableStateFlow(
        NoteEditorState(
            title = savedStateHandle["title"] ?: "",
            body = savedStateHandle["body"] ?: ""
        )
    )

    fun onTitleChange(title: String) {
        savedStateHandle["title"] = title
        _state.update { it.copy(title = title) }
    }
}
```

---

## Checklist: Adding a New Screen

- [ ] Define `State` and `Event` interfaces
- [ ] Implement `ViewModel` with action functions
- [ ] Create `<Screen>Root` composable (holds ViewModel, observes events)
- [ ] Create `<Screen>Screen` composable (pure state + callbacks, previewable)
- [ ] Map any domain errors to `UiText`
- [ ] Add `SavedStateHandle` for any form fields that must survive process death
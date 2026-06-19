---
name: Android lifecycle 2.9.0 ViewModel factory
description: lifecycle 2.9.0 rewrote ViewModelProvider; hand-written Class-based factories break — use the viewModelFactory{} DSL and keep all lifecycle artifacts on one version.
---

# androidx.lifecycle 2.9.0 ViewModel wiring

**Rule:** Do not hand-write a `ViewModelProvider.Factory` that overrides
`create(modelClass: Class<T>): T`. Use the DSL instead:

```kotlin
val factory = viewModelFactory {
    initializer { AuthViewModel(repo) }
    initializer { HomeViewModel(repo) }
}
val vm: AuthViewModel = viewModel(factory = factory)
```

Imports: `androidx.lifecycle.viewmodel.viewModelFactory`,
`androidx.lifecycle.viewmodel.initializer`. Multiple `initializer{}` blocks on one
factory are fine — each registers by the reified VM type.

**Why:** lifecycle 2.9.0 rewrote `ViewModelProvider` in Kotlin/KMP and replaced the
`Class<T>`-based `create(...)` with `create(modelClass: KClass<T>, extras: CreationExtras)`.
A hand-written override of the old `Class<T>` signature "overrides nothing" → compile
error (this surfaced as the user's "error in viewmodel" in Android Studio).

**Also:** keep every `androidx.lifecycle:*` artifact on the SAME version. We had
`lifecycle-runtime-ktx` pinned to an older version while the rest were 2.9.0 — unify
them via one catalog `lifecycle` ref. `viewModelScope` and `collectAsStateWithLifecycle`
need no extra deps: they come from `lifecycle-viewmodel` (via `lifecycle-viewmodel-compose`)
and `lifecycle-runtime-compose` respectively.

**How to apply:** any time you wire a ViewModel with constructor args on this project's
Android app, reach for the `viewModelFactory{}` DSL, never a manual Factory override.

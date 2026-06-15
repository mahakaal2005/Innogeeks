---
name: Recruitment window / quiz academic-year invariant
description: The single rule that gates Round 1 quiz access across status + quiz endpoints; why there is no year fallback.
---

# Recruitment window gates Round 1, keyed by academic_year

The Round 1 quiz is "live" only when BOTH are true for the application's
`academic_year`: an open `recruitment_windows` row (`is_open=true`) exists AND a
published `quizzes` row exists for that domain + that exact `academic_year`.
This same rule must hold across every path that touches quiz content:
`GET /recruitment/status`, `POST /quiz/validate-email`, `GET /quiz/:quizId`, and
`POST /quiz/:quizId/submit`.

**Rule:** quiz resolution matches `academic_year` EXACTLY — never fall back to a
prior year's published quiz, and always re-check the window before returning quiz
metadata or questions (not just on submit).

**Why:** a year-fallback or an unguarded `GET /quiz/:quizId` lets a crafted
request fetch/disclose an old published quiz's questions while the current window
is closed — silently bypassing the "test only live on the announced date"
guarantee. The quiz site has no login (invigilated PCs), so the server window
check is the only gate.

**How to apply:** if you add any new endpoint that reads a quiz or its questions,
gate it with `isRecruitmentWindowOpen(quiz.academic_year)` and resolve quizzes by
exact academic_year. Keep the `testLive` definition in `/recruitment/status` and
the quiz-resolution rule in lockstep — if one changes, change the other.

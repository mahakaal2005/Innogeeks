---
name: Quiz site no-login model
description: Why the Round 1 quiz site (artifacts/quiz-site) has no auth and only uses a KIET email, and what NOT to "fix".
---

The Round 1 recruitment quiz site identifies a student solely by their `@kiet.edu`
email — there is no login, OTP, or account. The Express endpoints it uses
(`/api/quiz/validate-email`, `GET /api/quiz/:id`, `POST /api/quiz/:id/submit`)
trust the email + applicationId in the request body.

**Why:** This is a deliberate product decision, not an oversight. The quiz is taken
on **invigilated college computers** during recruitment, so physical proctoring is
the access control. The task spec explicitly lists login/Clerk auth as out of scope.
A security review (architect) flagged the email-impersonation risk and the
client-only timer as FAIL-level; both are accepted tradeoffs of this model.

**How to apply:** Do not add authentication, OTP, or server-authoritative attempt
timers to the quiz site as if they were bugs. If stronger integrity is ever needed
(proof-of-possession code, server-side `started_at/expires_at` attempt rows, single
server-enforced submission), treat it as a NEW scoped feature the user opts into —
raise it as a follow-up, don't silently implement it.

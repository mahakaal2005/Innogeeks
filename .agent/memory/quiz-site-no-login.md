---
name: Quiz site no-login model
description: Why the Round 1 quiz site (artifacts/quiz-site) has no auth and only uses a KIET email, and what NOT to "fix".
---

The Round 1 recruitment quiz site identifies a student solely by their `@kiet.edu`
email — there is no login, OTP, or account.

**Why:** Deliberate product decision, not an oversight. The quiz is taken on
**invigilated college computers** during recruitment, so physical proctoring is the
access control. Login/auth is explicitly out of scope for this artifact. A security
review flagged the email-impersonation risk and the client-side timer as
FAIL-level; both are accepted tradeoffs of this model.

**How to apply:** Do not add authentication, OTP, or a server-authoritative attempt
timer to the quiz site as if they were bugs. If stronger integrity is ever wanted
(proof-of-possession code, server-side attempt deadlines, single enforced
submission), treat it as a NEW opt-in feature — raise it as a follow-up, don't
silently implement it.

**Note (not a tradeoff):** server-side *eligibility* gating IS still required and
expected — only a paid, shortlisted (`status = round1_qualified`), not-yet-attempted
application may take or submit the quiz. That is gatekeeping, separate from the
no-login decision above.

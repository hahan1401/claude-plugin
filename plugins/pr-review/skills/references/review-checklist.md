# PR Review Checklist

A full checklist to run through during Step 3 of the PR review process.

---

## 1. Correctness

- [ ] Logic matches the PR description / ticket requirements
- [ ] No missing `await` on async calls
- [ ] No unhandled `null` / `undefined` paths for data from external sources
- [ ] Conditionals use the right operator (`===` vs `==`, `!==` vs `!=`)
- [ ] Loop boundaries are correct (off-by-one, empty array handling)
- [ ] Return values are used where expected (no fire-and-forget)
- [ ] Recursive functions have a clear base case
- [ ] Date/time handling accounts for timezone differences

---

## 2. Security

- [ ] No hardcoded secrets, API keys, tokens, or passwords
- [ ] User input is validated/sanitized before use in DB queries, shell commands, or HTML
- [ ] New API endpoints are protected by appropriate auth guards
- [ ] Authorization checks exist (not just authentication — can this user do this action?)
- [ ] No unsafe type assertions (`as SomeType`) hiding potential runtime mismatches
- [ ] File uploads validated for type and size
- [ ] No `eval()`, `new Function()`, or dynamic `require()` with user-controlled input
- [ ] Sensitive data not logged

---

## 3. Breaking Changes

- [ ] Exported function/type signatures not changed without a migration plan
- [ ] Database schema changes accompanied by a migration file
- [ ] Renamed/removed API fields documented or versioned
- [ ] Environment variable additions documented (`.env.example` updated)
- [ ] Removed endpoints return 410 Gone or are properly deprecated
- [ ] Dependent services/consumers considered for any contract change

---

## 4. Test Coverage

- [ ] New public functions have unit tests
- [ ] New API endpoints have integration/e2e tests
- [ ] Edge cases covered: null input, empty arrays, boundary values, error paths
- [ ] Deleted tests have a documented reason
- [ ] Mocks are typed correctly and match the real shape
- [ ] Async tests properly `await` assertions
- [ ] Test descriptions are specific and meaningful

---

## 5. Code Quality

- [ ] No duplicated logic — extracted to a shared helper if used more than once
- [ ] Functions have a single clear responsibility
- [ ] No function longer than ~50 lines without good reason
- [ ] Magic numbers/strings extracted to named constants
- [ ] No dead code: unused imports, variables, unreachable branches
- [ ] Variable and function names are descriptive
- [ ] Complex logic has a comment explaining *why*, not just *what*
- [ ] No commented-out code left in

---

## 6. Performance (flag only if clearly impactful)

- [ ] No N+1 query patterns introduced in loops
- [ ] Heavy computations not blocking the event loop (should be async or offloaded)
- [ ] No unnecessary deep clones (`JSON.parse(JSON.stringify(...))`) in hot paths
- [ ] Pagination used for endpoints that could return large datasets
- [ ] Database queries use indexes where appropriate

---

## 7. Observability

- [ ] Errors are logged with enough context to debug in production
- [ ] New async jobs/queues have failure handling and logging
- [ ] Health-check / metrics unaffected by the change

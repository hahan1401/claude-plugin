# TypeScript Review Checklist

A comprehensive checklist to run through during Step 3 of the review process.

---

## 1. Type Correctness

- [ ] No use of `any` where a more specific type is possible
  - Prefer `unknown` + type guard / narrowing
  - Prefer generics for reusable utilities
- [ ] No unsafe `as` casts (e.g., `data as User` without validation)
  - Prefer type guards: `function isUser(x: unknown): x is User { ... }`
- [ ] Non-null assertions (`!`) are justified (e.g., value is guaranteed by context)
- [ ] Explicit return types on all public/exported functions
- [ ] Generic type parameters have appropriate constraints
- [ ] Discriminated unions are exhaustively handled
  - Switch statements have a `default` that asserts `never`
- [ ] Index signatures (`[key: string]: value`) are intentional and not hiding a stricter shape
- [ ] Mapped types and conditional types are readable and correct
- [ ] `Partial<T>`, `Required<T>`, `Pick<T>`, `Omit<T>` used appropriately
- [ ] No `@ts-ignore` without an explanatory comment on why it's unavoidable
- [ ] Enums: prefer `const enum` or string literal unions over numeric enums
- [ ] Interfaces vs. types: consistent usage within the codebase

---

## 2. Async and Concurrency

- [ ] Every `async` function has at least one `await` (or is intentionally returning a Promise)
- [ ] No fire-and-forget async calls where errors would be silently swallowed
- [ ] Independent async operations run in parallel with `Promise.all` / `Promise.allSettled`
- [ ] `Promise.allSettled` used when individual failures should be tolerated
- [ ] No `.then()/.catch()` chains mixed with `async/await` without reason
- [ ] Async functions in `useEffect` are wrapped correctly (effect callback itself is not async)
- [ ] Race conditions guarded against (e.g., stale closures, outdated fetch results)
- [ ] AbortController used for cancellable fetch calls where appropriate

---

## 3. Error Handling

- [ ] `try/catch` blocks don't have empty catch bodies
- [ ] Caught errors are typed with `instanceof Error` before accessing `.message`
- [ ] API responses are validated/narrowed before use — not blindly cast to a type
- [ ] Network/IO errors propagate meaningfully to the caller or are logged
- [ ] Custom error classes extend `Error` correctly (set `name`, call `super(message)`)
- [ ] Error boundaries present in React component trees (for TSX code)

---

## 4. React / TSX Specific

- [ ] Component props defined as an `interface` or `type`; not overly permissive
- [ ] `useEffect` dependency array is correct and complete — no stale closure bugs
- [ ] `useEffect` cleanup function returns when side-effects need teardown
- [ ] `useState` is typed explicitly if initial value doesn't convey the full type
- [ ] `useRef` typed correctly (`useRef<HTMLInputElement>(null)` etc.)
- [ ] `useCallback` / `useMemo` used only where there is measurable benefit
- [ ] No inline object/array/function literals in JSX props on every render
- [ ] Event handler types are specific (`React.MouseEvent<HTMLButtonElement>`, etc.)
- [ ] List items have stable, unique `key` props (not array index unless list is static)
- [ ] Context typed with `createContext<MyType>` — not defaulting to `undefined` without handling
- [ ] Forwarded refs use `React.forwardRef<RefType, PropsType>` correctly
- [ ] No `dangerouslySetInnerHTML` without explicit sanitization

---

## 5. Security

- [ ] No secrets, API keys, or tokens hardcoded in source
- [ ] User-controlled strings never passed to `eval()`, `new Function()`, or template literals used as code
- [ ] Dynamic `import()` paths are not constructed from user input
- [ ] No prototype pollution (e.g., merging untrusted objects onto `{}`)
- [ ] `dangerouslySetInnerHTML` content sanitized (e.g., DOMPurify)
- [ ] URL construction from user input validated/encoded

---

## 6. Performance

- [ ] Expensive computations in React components wrapped in `useMemo`
- [ ] Callback functions passed as props wrapped in `useCallback` when children are memoized
- [ ] No `JSON.parse(JSON.stringify(x))` for deep cloning in hot paths — use structured clone or a library
- [ ] No large data structures created inside render loops without caching
- [ ] `useEffect` dependencies don't cause unintended infinite loops
- [ ] Subscriptions, timers, and event listeners cleaned up on unmount

---

## 7. Maintainability

- [ ] Functions and variables have descriptive names
- [ ] Files/modules have a single clear responsibility
- [ ] No functions longer than ~50 lines without good reason
- [ ] Magic numbers/strings extracted into named constants
- [ ] Dead code removed (unreachable branches, unused imports, unused variables)
- [ ] Complex logic has comments explaining *why*, not just *what*
- [ ] Barrel exports (`index.ts`) don't create circular dependency chains

---

## 8. Tests

- [ ] New logic has accompanying unit tests
- [ ] Edge cases covered: null/undefined inputs, empty arrays, boundary values
- [ ] Async tests properly `await` all assertions
- [ ] Mocks are typed correctly and not overly permissive
- [ ] Test descriptions are specific and meaningful
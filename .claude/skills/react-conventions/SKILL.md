---
name: react-conventions
description: >-
  Engineering standard for the React code in this repo. States the bar code is held to, what a
  review flags as blocking, and the gate commands that must pass. Loaded on demand by /start-issue,
  /pr-review and /fix-review-comments for issues and diffs that touch React code; never pre-read.
---

# React conventions

This skill is a **standard, not a description**: it states the bar this repo holds `React` code to,
not a narration of what the code currently does. Apply it to the lines a change **adds or modifies**;
pre-existing violations in untouched code are backlog issues, not blockers. Surrounding code is never
precedent for a new violation.

## How this skill is used

- `/start-issue` loads it when an issue touches this stack, before any code is written.
- `/pr-review` and `/pr-review-ci` hand it to the **Reviewer Agents**, which report only the
  violations listed under **Blocking in review** below.
- `/fix-review-comments` verifies each finding against it before changing code.
- `.claude/conventions/comment-conventions.md` applies to every source file in this stack and is a
  gate: a comment in a source file fails the change.

## What a blocking finding is

A review flags a change only for: a correctness bug, a security hole, data loss or a crash; a
regression the issue did not ask for; a break of a contract or interface without its accompanying
change; a rule in **Blocking in review** below; or an unmet acceptance criterion. Style preferences,
alternative designs and "consider" remarks are not findings and are never posted.

## Project-specific

**Package Manager** and **Gate Commands** are registered once in `CLAUDE.md` under
`## Project-specific`, with **Stack** naming every stack in the repo. Read them there; they are not
restated here.

What lives here is the standard itself — the **Scope** this skill governs and the rules a change is
held to. Keep it free of counts, versions, issue numbers, file inventories and dates; those move.

- **Scope**: `src/`

This app is the Frontend Interview Prep assignment (Set 2): five independent features, each on its
own route, reading public data from https://dummyjson.com. The assignment forbids a UI library that
does the core work of a question; the work itself is the code under review.

**Architecture rules**:
- A question lives in its own folder under `src/features/<feature>/`, with its page, components,
  hooks, pure helpers and tests beside each other. One feature never imports from another.
- A question is registered in `src/questions.ts` and given a `<Route>` in `src/App.tsx`.
- A component reused across features lives under `src/components/`; a hook reused across features
  lives in `src/hooks/` and is named `use*`; a generic helper lives in `src/lib/`.
- Imports are relative and carry their `.ts` or `.tsx` extension; a type-only import uses
  `import type`.
- Business logic (totals, paging, ordering, merging, queueing) is a pure, typed function outside the
  component, so it is tested without rendering.
- Styling is Tailwind, using the theme tokens defined in `src/index.css`. Classes are merged with
  `cn()`. No inline styles, CSS modules or SCSS.
- No UI, drag-and-drop, virtualised list, data grid or state library does a question's core work.

**TypeScript rules**:
- Strict mode holds: no `any`, no non-null assertion `!` to silence a possible `undefined`, no
  `@ts-ignore` or `@ts-expect-error`.
- Data from the network or from storage is `unknown` until a type guard or parser checks its shape.
- A union of states (`idle | loading | error | success`) is a discriminated union, not several
  booleans that can disagree.

**State, data and API rules**:
- A value derivable from props or state is computed during render, not stored and synced with an
  effect.
- Money is held in integer cents or rounded at one well-defined point, and always displayed to two
  decimal places.
- A request can be cancelled: it takes an `AbortSignal`, and an effect aborts it on unmount or when
  its inputs change, so a stale response never overwrites a newer one.
- Overlapping loads are guarded so the same page or item is never requested or rendered twice.
- Every fetch renders its loading, empty and error states, and an error offers a retry.
- Persisted state goes through one typed storage helper that survives malformed or missing data.
- An effect declares every dependency it reads and cleans up its subscriptions, timers, sockets and
  in-flight work when the component unmounts.
- Every interaction a mouse can do has a keyboard path, and controls carry accessible names.

**Testing rules**:
- Every new or changed feature has at least one test beside it that exercises behaviour.
- A test drives the UI the way a person would, through `userEvent` rather than `fireEvent`, and
  queries by role, label or text.
- A test asserts what the user can observe, not internal implementation details.
- The network is mocked at the `fetch` boundary; a test never calls the real API.

**Blocking in review**:
- User-supplied data rendered as raw HTML without sanitisation.
- A secret, API key or credential in source, or personal data written to the console.
- A new question missing from `src/questions.ts` or the router.
- `any`, a non-null assertion, or a type suppression added to silence the compiler.
- Network or storage data used without checking its shape.
- A stale or duplicate response that can overwrite newer data or render an item twice.
- Derived state stored and synced with an effect, so it can drift from its source.
- Money computed or displayed with floating-point error, or not to two decimal places.
- An effect with a missing dependency or no cleanup, causing a stale value or a leak.
- A fetch with no loading, error or retry state.
- An interaction with no keyboard path.
- A library that does a question's core work.
- A feature with no behavioural test.
- A comment in a changed source file.

**Definition of done**:
- The gate commands registered in `CLAUDE.md` pass.
- The question's route is registered and reachable from the home page and the header.
- Every requirement and acceptance criterion of the question is met.
- Every new or changed feature has a test that exercises behaviour.

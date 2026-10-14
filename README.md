# frontend-interview-prep

Frontend interview prep assignment (Set 2): five React + TypeScript (strict) features, each on its own
route and shipped as its own pull request.

## Run it

Requires Node 22 and pnpm.

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

| Command | What it does |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm test` | Run the Vitest + Testing Library suite |
| `pnpm lint` | ESLint with zero warnings allowed |
| `pnpm typecheck` | TypeScript strict type-check |
| `pnpm build` | Type-check and production build |

Stack: Vite, React 19, TypeScript (strict), React Router, Tailwind CSS, Vitest, Testing Library, ESLint, Prettier.

## Claude Code harness

`CLAUDE.md` and `.claude/` hold the Claude Code harness: guardrail hooks (secrets, unsafe shell
commands, commits to `main`, lint on edit), the repo's conventions, and the workflow skills
`/create-issue`, `/start-issue`, `/raise-pr`, `/pr-review` and `/fix-review-comments`. The repo's own
values live under `## Project-specific` in `CLAUDE.md`.

| Command | What it does |
|---|---|
| `node .claude/harness/verify.cjs` | Check the harness files against the shared set |
| `node .claude/hooks/tests/run-all.cjs` | Run the guardrail hook tests |

## Questions

| # | Question | PR link |
|---|---|---|
| 1 | Shopping Cart | |
| 2 | Infinite Feed | |
| 3 | Kanban Board | |
| 4 | Live Dashboard | |
| 5 | Comments with Offline Support | |

**Video:**

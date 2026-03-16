---
title: Git Branching & Commit Message Conventions
---

## Goals

- Keep history readable and searchable.
- Make it easy to understand **what changed** and **why** at a glance.
- Keep conventions lightweight so they’re easy to follow consistently.

## Branching conventions

- **Main branches**
  - `main`: stable, deployable branch.

- **Feature / work branches**
  - Pattern: `type/short-topic`
  - Common `type` prefixes:
    - `feature/` – new features or major enhancements.
    - `fix/` – bug fixes.
    - `chore/` – tooling, config, refactors that don’t change behavior.
    - `docs/` – documentation-only changes.
  - Examples:
    - `feature/x-reply-variants`
    - `fix/openai-timeout-handling`
    - `chore/tailwind-cleanup`

### Branching guidelines

- Create a **separate branch per logical task**; avoid mixing unrelated changes.
- Favor **small, focused branches** over large, long-lived ones.
- If a branch grows too large, consider:
  - Splitting it into multiple smaller branches.
  - Landing incremental pieces behind feature flags or clearly isolated paths.

## Commit message format

- **Format**
  - `<type>: <short, imperative summary>`
  - Examples:
    - `feat: add OpenAI variant generation endpoint`
    - `fix: handle missing x client secret more clearly`
    - `chore: simplify token store logging`
    - `docs: document cursor rules structure`

- **Allowed `type` values**
  - `feat` – new user-visible behavior or capabilities.
  - `fix` – bug fix or behavior correction.
  - `chore` – refactors, build, tooling, or non-functional changes.
  - `docs` – documentation-only.
  - `refactor` – structural changes without changing behavior.
  - `test` – adding or modifying tests.

### Subject line rules

- Use the **imperative mood**:
  - Good: `feat: add x dashboard layout`
  - Avoid: `feat: added x dashboard layout` or `feat: adds x dashboard layout`
- Keep the subject **short (~72 chars max)** and specific.
- Focus on **what** changed, not **how**:
  - Good: `fix: prevent duplicate tweet replies`
  - Less helpful: `fix: update if conditions in reply handler`

### Commit body (optional but recommended)

- Use the body to explain:
  - **Why** the change was needed (motivation, bug, design choice).
  - Any **trade-offs** or follow-up work.
  - Relevant **links** (issue numbers, PRs, docs).
- Wrap lines at ~72–80 characters when possible.

Example:

```text
feat: add x reply variants endpoint

- Add /api/x/replies/variants route that calls lib/openai
- Normalize OpenAI errors to user-safe messages
- Reuse SYSTEM_PROMPT patterns from existing openai helpers
```

## Commit hygiene

- Prefer **multiple small commits** over one giant “big changes” commit.
- Each commit should ideally be:
  - Buildable (tests and typechecks pass).
  - Focused on a single concern.
- Avoid committing:
  - Secrets (`.env`, keys, tokens).
  - Large generated files or build artifacts.

## When to amend vs new commit (local only)

- Safe to use `git commit --amend` while:
  - The commit is **not yet pushed**.
  - You’re fixing a typo, small detail, or adding a missing file.
- Prefer a **new commit** when:
  - The change is non-trivial.
  - You’ve already pushed the branch or shared it.

## Practical workflow example

1. Create a branch:
   - `git checkout -b feature/x-search-filters`
2. Make changes in small steps and commit:
   - `feat: add ui for x search filters`
   - `fix: handle empty query gracefully`
3. Re-run tests / typecheck before final push.
4. Push and open a PR from the feature branch into `main`.

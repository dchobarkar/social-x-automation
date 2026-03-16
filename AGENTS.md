# Cursor Agents for This Project

This repository is a small Next.js App Router app that automates engagement on X (Twitter) using local API routes, X OAuth with PKCE, and OpenAI.

When working in this project, the AI should:

- **Respect the architecture**
  - Treat `app/api/**` as backend entrypoints and route work through a service layer (`services/**`) and integration layer (`integrations/**`) as the project evolves.
  - Keep provider-specific integrations in `integrations/**`, app-level business logic in `services/**`, shared helpers in `lib/**`, and UI logic/components in `app/**` and `components/**` (with shared types in `types/**`).

- **Use project conventions**
  - Follow `.cursor/rules/*` for stack versions, coding style, architecture, UI patterns, and security (tokens, OAuth, OpenAI).
  - Prefer Tailwind v4 utilities and design tokens from `app/globals.css` when styling UI.

- **Be cautious with automation**
  - Preserve existing OAuth and token flows; avoid changing redirect URIs or security-sensitive logic without explicit instruction.
  - Keep generated replies and new AI features aligned with the non-spammy, helpful behavior described in `README.md` and `lib/openai.ts`.

This file is a high-level guide; detailed constraints live in the individual rule files under `.cursor/rules/`.

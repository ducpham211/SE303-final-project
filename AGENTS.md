# AGENTS.md — AI Agent Rulebook

> **This file is the absolute source of truth for any AI agent operating in this repository.**
> Read it fully before generating, modifying, or suggesting any code.

---

## 1. Context & Source of Truth

- **ALWAYS** read the project's `.md` documentation files **before** writing code:
  - `description.md` — System overview & business logic.
  - `system-plan.md` — Sprint plan & milestones.
  - `database_design.md` / `database-design.md` — Full DB schema & API specification.
  - `functions.md` / `tong_hop_chuc_nang.md` — Feature inventory (core + future).
  - `project-roadmap.md` — 8-week roadmap, team roles, tech stack summary.
  - `team-guidelines.md` — Git workflow, coding conventions, task management.
  - `phan_cong_nhiem_vu.md` — Task assignment matrix.
- **NEVER** guess the architecture, DB schema, API endpoints, or role definitions. If information is missing from docs, **ask** instead of assuming.

---

## 2. Tech Stack (Mandatory)

| Layer | Technology |
|---|---|
| **Frontend Framework** | ReactJS (Vite) |
| **Styling** | Tailwind CSS + CSS Variables from `src/index.css` |
| **Routing** | React Router DOM |
| **State Management** | Zustand |
| **HTTP Client** | Axios (via `src/services/`) |
| **Real-time** | WebSocket / Socket.io (client) |
| **Backend** | Java Spring Boot _(not managed in this frontend workspace)_ |
| **Database** | PostgreSQL (Supabase) + Prisma ORM |
| **Cache / Locks** | Redis |
| **Payments** | Momo / Stripe |

> [!CAUTION]
> Do **NOT** introduce additional UI libraries (Material UI, Ant Design, Chakra, etc.) or state managers (Redux, Recoil, etc.) unless explicitly approved.

---

## 3. Architecture & Folder Structure

```
frontend/src/
├── assets/          # Static images, SVGs, fonts
├── components/      # Reusable, role-agnostic UI components
├── pages/           # Role-based page structure (see below)
│   ├── auth/        # Login, Register, Forgot Password
│   ├── player/      # Player-facing pages (booking, matchmaking, chat)
│   ├── owner/       # Owner-facing pages (field mgmt, dashboard, pricing)
│   └── admin/       # Admin panel (user mgmt, moderation, analytics)
├── routes/          # Route definitions & role-based guards
├── services/        # Axios API service modules (one file per domain)
├── store/           # Zustand stores (one file per domain slice)
├── utils/           # Pure helper/utility functions
├── index.css        # Global CSS variables & base styles
├── App.jsx          # Root component & router mount
└── main.jsx         # Entry point
```

### Rules

1. **Pages** must live inside their role folder (`pages/player/`, `pages/owner/`, etc.). Shared/public pages go in `pages/auth/`.
2. **Components** must be reusable and role-agnostic. If a component is role-specific, co-locate it inside the relevant `pages/<role>/components/` sub-folder.
3. **Services** (`services/`) encapsulate all Axios calls. One service file per API domain (e.g., `authService.js`, `fieldService.js`, `bookingService.js`).
4. **Store** (`store/`) contains Zustand store slices. One file per domain (e.g., `useAuthStore.js`, `useBookingStore.js`).
5. **Routes** (`routes/`) define route configuration and protected route wrappers with role guards (`PLAYER`, `OWNER`, `ADMIN`).
6. **No business logic in components.** Keep API calls in `services/`, state in `store/`, and derivation in `utils/`.

---

## 4. Strict Constraints

### Styling

- Use **Tailwind utility classes** for all styling. Compose them directly in JSX via `className`.
- For design tokens (colors, fonts, shadows), reference the CSS custom properties defined in `src/index.css` (e.g., `var(--accent)`, `var(--bg)`, `var(--text-h)`).
- **Raw CSS files per component are PROHIBITED.** Do not create `.css` or `.module.css` files for individual components.
- Exception: `index.css` (global variables/base resets) and `App.css` (root layout only, should be migrated to Tailwind over time).

### Responsive / Mobile-First

- **Design mobile-first.** Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) to scale UP, not down.
- All layouts must be functional at `320px` viewport width minimum.

### User Roles & Auth

- The system has exactly **3 roles**: `PLAYER`, `OWNER`, `ADMIN`.
- Every protected route must enforce role-based access via route guards in `routes/`.
- UI menus and navigation must render differently per role.

### Code Quality

- **English-only** for all variable names, function names, file names, and commit messages.
- Follow **Conventional Commits**: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`.
- Remove dead/commented-out code before committing.
- Write comments only to explain **WHY**, never **WHAT** (code should be self-documenting).
- Keep components small and focused. Extract reusable logic into custom hooks or `utils/`.

### Output Rules for AI Agents

- **Code-first.** Output working code, not boilerplate explanations.
- Provide **concise** responses. No filler paragraphs.
- Always include the full file path when creating or editing files.
- When generating a new page, also update the route config in `routes/`.
- When adding a new API integration, create the service function in `services/` and wire it through a Zustand store in `store/`.

---

## 5. Git Workflow (Enforced)

- **Never** commit directly to `main` or `develop`.
- Branch naming: `feature/<short-name>`, `fix/<short-name>`.
- Every PR requires at least **1 code review** before merge.
- Do **NOT** commit `.env`, `node_modules/`, API keys, or database credentials.
- Maintain `.gitignore` and `.env.example` rigorously.

---

## 6. API & Database Reference

- All API endpoints and DB schema are documented in `database_design.md`.
- Base API path pattern: `/api/<domain>/<action>`.
- Auth uses JWT tokens. Include `Authorization: Bearer <token>` on all protected requests.
- Real-time events (chat, notifications, booking status) use WebSocket channels documented in `database_design.md § II.6`.

---

_Last updated: 2026-03-24. This file is auto-generated from project documentation and should be kept in sync with any architectural changes._

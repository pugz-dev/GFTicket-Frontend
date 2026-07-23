# GFTicket - Frontend

A monorepo containing two independent frontend applications for the **GFTicket** platform — a ticket sales platform for live events built as a training project for GFT's "Escuela de Juniors".

## Project Overview

**GFTicket** is a full-stack MVP that lets users browse events, register/log in, and simulate the purchase of tickets. This repository contains the client-side implementations:

- **gfticket-angular**: Public-facing web application — event catalog (with name/locality/genre filters), event detail, registration, login, profile editing, simulated purchase flow, purchase confirmation, and a "my tickets" page.
- **gfticket-react**: Admin panel for event management (CRUD operations on events).

The backend (a real REST API, maintained by a separate team) is already deployed. This frontend consumes it directly — **no mocks**. User accounts and purchased tickets are simulated client-side in `localStorage` (there is no backend auth endpoint yet); only event data and the payment gateway call hit the real API.

**Timeline**: Sprint 1 (13–15 July) · Sprint 2 (16–20 July) · Sprint 3 (21–24 July) + presentation.

## Repository Structure

```
GFTicket-Frontend/
├── gfticket-angular/          # Angular 22+ app (public web)
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Reusable components (event-catalog, event-list)
│   │   │   ├── pages/         # Route-level pages (public-home, event-detail,
│   │   │   │                  #   login, register, perfil, cart,
│   │   │   │                  #   confirmation-purchase, mis-entradas)
│   │   │   ├── services/      # event, auth, purchase, user-storage
│   │   │   ├── guards/        # auth.guard (protects carrito/perfil/mis-entradas... — see app.routes.ts)
│   │   │   ├── models/        # TypeScript interfaces
│   │   │   ├── app.routes.ts  # Application routing
│   │   │   └── app.ts         # Root component
│   │   ├── environments/      # apiUrl config (dev/prod)
│   │   ├── styles.css         # Global styles
│   │   └── index.html
│   ├── jest.config.js         # Jest testing configuration (per-folder coverage thresholds)
│   ├── angular.json
│   └── README.md
├── gfticket-react/            # React + Vite app (admin panel)
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API & business logic
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── README.md
├── .github/
│   └── workflows/
│       ├── commit-lint.yml    # CI: validates commit messages on PRs to main
│       └── coverage.yml       # CI: runs the test suite (with coverage) for both apps on PRs to main
├── .gitignore
└── README.md (this file)
```

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** 9+.
- **Git** configured with valid credentials for the GitHub repo.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/pugz-dev/GFTicket-Frontend.git
   cd GFTicket-Frontend
   ```

2. Install dependencies **for both applications**:
   ```bash
   # From the monorepo root
   cd gfticket-angular && npm install
   cd ../gfticket-react && npm install
   ```

Each app has its own `package.json` and `node_modules` — they are completely independent.

## Development Workflow

### Starting the Development Servers

Run each app in a separate terminal:

**Angular (public web) — port 4200:**
```bash
cd gfticket-angular
npm start
# or: ng serve
```

**React (admin panel) — port 5173:**
```bash
cd gfticket-react
npm run dev
```

Then open your browser:
- Angular: `http://localhost:4200`
- React: `http://localhost:5173`

### Common Commands

**Angular app:**
```bash
cd gfticket-angular

npm start          # Start dev server
npm run build      # Compile to dist/
npm test           # Run Jest tests with coverage
```

**React app:**
```bash
cd gfticket-react

npm run dev        # Start dev server
npm run build      # Compile to dist/
npm test           # Run Vitest tests
npm run lint       # Run ESLint
```

## Git Conventions

All commits and branches must follow strict naming conventions so that Jira automation rules (linking issues, transitioning statuses) trigger correctly.

### Commit Messages

Format: **Conventional Commits** with a Jira scope.

```
<type>(<scope>): <description>
```

**Types**: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`

**Examples**:
```
feat(SCRUM-430): add fast purchase button to the event catalog
fix(SCRUM-398): show event and purchase dates in mis-entradas
chore: reformat date in tickets page
```

**Important**: Commit messages are **always in English**, even though team communication is in Spanish. Enforced by the `commit-lint` workflow on every PR to `main` (`@commitlint/config-conventional` — type is required, scope is optional).

### Branch Names

Format:
```
feature/<SCRUM-id>/<SCRUM-id>-short-description
```

**Examples**:
```
feature/SCRUM-258/SCRUM-295-associate-bought-ticket-to-the-user
feature/SCRUM-400-fast-purchase-from-the-catalog
```

**Note**: Each branch should correspond to a Jira subtask. If there's no Jira ID yet (e.g. a quick chore branch), use a descriptive name without the ID.

### Pull Request Process

1. Create a feature branch from `main`.
2. Commit with conventional format (enforced by `commit-lint`).
3. Push and open a PR against `main`.
4. Ensure:
   - All status checks pass (`commit-lint`, `coverage` — tests for both apps).
   - At least 1 approval from a team member.
   - All conversations resolved.
   - The branch is up to date with `main`.
5. Merge with a **merge commit** (no squash).

## Testing

Both applications use automated testing to ensure quality. Tests must pass before merging to `main`, and unit tests should be written **before implementation** (TDD).

### Angular (Jest)

```bash
cd gfticket-angular

npm test                       # Run all tests with coverage
npm test -- src/app/pages/cart # Run a specific folder/file
```

**Coverage thresholds** (enforced in `jest.config.js`, per folder): services 70%, components 50%. Overall coverage is reported on every PR by the `coverage` workflow.

**Test file location**: co-located with source files, e.g. `event-catalog.ts` and `event-catalog.spec.ts` in the same folder.

### React (Vitest)

```bash
cd gfticket-react

npm test               # Run all tests
npm test -- --coverage # Run with coverage
```

## Architecture & Patterns

### Angular App

**Structure**: standalone components (no NgModules), functional route guards, signals for reactive auth state.

**Key patterns**:
- **Services**: dependency-injected, own API calls and business logic (`EventService`, `PurchaseService`) or the simulated user/session storage (`AuthService`, `UserStorageService`).
- **Auth**: fully simulated client-side — `UserStorageService` keeps the user list in `localStorage`; `AuthService` exposes the logged-in user as a signal (`usuarioActual`) and is read directly in templates.
- **Routing**: defined in `app.routes.ts`, lazy-loaded per route (`loadComponent`). Sensitive routes (`carrito/:id`, `perfil`) use `authGuard` to require a session.
- **Styling**: component-scoped CSS + a shared dark theme built on OKLCH colors (see the Angular app's own README for the palette).

See [gfticket-angular/README.md](gfticket-angular/README.md) for the full breakdown (project structure, testing, API integration, design system).

### React App

**Structure**: functional components with hooks.

**Key patterns**:
- **Services**: custom hooks / fetch calls for the admin API.
- **State management**: React hooks (`useState`, `useContext`).
- **Components**: atomic design approach (atoms, molecules, organisms).

## API Integration

Both apps consume a **shared backend REST API**, already deployed and maintained by a separate team — a "TeacherBanking" academic environment, not a production service, so occasional downtime is expected.

**Base URL** (from `environment.ts`):
```
http://teacherbanking.us-east-1.elasticbeanstalk.com
```

**Endpoints actually used by the Angular app**:
- `GET /eventos` — list all events
- `GET /eventos/:id` — get event detail
- `POST /pasarela/compra` — submit a simulated card payment for a ticket purchase

There is currently **no backend endpoint for users/auth** — registration, login, and purchased-ticket history are all simulated in `localStorage` on the client (see `UserStorageService`/`AuthService`). The React admin panel's CRUD endpoints for events are documented in its own README.

**No mocks for event/payment data** — always test against the real API.

## Deployment

Deployment is **not yet configured** but will be set up on Heroku, Netlify, or similar during Sprint 3.

When deploying, ensure:
- Environment variables are set (API base URL, etc.).
- Build succeeds without errors: `npm run build`.
- Tests pass: `npm test`.
- Production builds are optimized and minified.

## Definition of Done (DoD)

A feature is **not considered complete** until:

1. ✅ The algorithm/functionality works as specified.
2. ✅ Manually verified in the browser that it does what was requested.
3. ✅ Unit tests are written **before implementation** (spec file exists, tests pass).
4. ✅ CSS/design is responsive (mobile, tablet, desktop).
5. ✅ Necessary documentation is updated.
6. ✅ Code is committed with a proper message and pushed.
7. ✅ Jira issue is updated (moved to Done).
8. ✅ PR is merged to `main`.

## Troubleshooting

### Port Already in Use
If port 4200 (Angular) or 5173 (React) is already in use:

**Angular**:
```bash
ng serve --port 4201
```

**React**:
```bash
npm run dev -- --port 5174
```

### Tests Fail After Merge
If tests fail after pulling new changes:
```bash
rm -rf node_modules package-lock.json
npm install
npm test
```

### HMR Not Working (Changes Not Reflecting)
- Make sure the dev server is still running.
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R).
- Restart the dev server: stop and `npm start` again.

### Module Not Found Errors
Ensure you're running `npm install` in the correct app folder:
```bash
# If error in gfticket-angular:
cd gfticket-angular && npm install

# If error in gfticket-react:
cd gfticket-react && npm install
```

## Contributing

1. **Pick a Jira ticket** from the sprint backlog.
2. **Create a feature branch** with the Jira ID (see Git Conventions above).
3. **Implement the feature** — tests first, then code + CSS.
4. **Verify locally**: dev server runs, tests pass, responsive design works.
5. **Commit and push** with a conventional message.
6. **Open a PR** against `main` and request review.
7. **Address feedback** and merge when approved.

For questions about technical decisions or business requirements, ask the teacher — not an AI assistant.

## Team

- **Pau Greus** (Scrum Master, Angular developer)
- **Alejandro** (Angular developer)
- **Jorge** (React developer)

Each person owns their app(s) and reviews PRs in their area.

## License

ISC

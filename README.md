# GFTicket - Frontend

A monorepo containing two independent frontend applications for the **GFTicket** platform — a ticket sales platform for live events built as a training project for GFT's "Escuela de Juniors".

## Project Overview

**GFTicket** is a full-stack MVP (minimum viable product) that allows users to browse and purchase tickets for live events (concerts, festivals, theater shows, etc.). This repository contains the client-side implementations:

- **gfticket-angular**: Public-facing web application (event listing, event detail, user registration, purchase flow, user profile).
- **gfticket-react**: Admin panel for event management (CRUD operations on events).

The backend (REST API) is maintained by a separate team and is already deployed. This frontend consumes that API with no mocks.

**Timeline**: Sprint 1 (13–15 July) · Sprint 2 (16–20 July) · Sprint 3 (21–24 July) + presentation.

## Repository Structure

```
GFTicket-Frontend/
├── gfticket-angular/          # Angular 22 app (public web)
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Reusable components (event-catalog, event-list, etc.)
│   │   │   ├── pages/         # Route-level pages (public-home, event-detail)
│   │   │   ├── services/      # Business logic (event-service)
│   │   │   ├── models/        # TypeScript interfaces
│   │   │   ├── app.routes.ts  # Application routing
│   │   │   └── app.ts         # Root component
│   │   ├── styles.css         # Global styles
│   │   └── index.html
│   ├── jest.config.js         # Jest testing configuration
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
│       └── commit-lint.yml    # CI: validates commits on PRs
├── .gitignore
└── README.md (this file)
```

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** 9+ (or **pnpm**).
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
npm test -- --no-coverage  # Run tests without coverage report
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

Format: **Conventional Commits** with Jira scope.

```
<type>(<scope>): <description>
```

**Types**: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`

**Examples**:
```
feat(SCRUM-54): implement event catalog grid
fix(SCRUM-87): correct date formatting in event detail
test: update assertions for date display format
chore: upgrade Angular to 22.0.6
```

**Important**: Commit messages are **always in English**, even though team communication is in Spanish.

### Branch Names

Format:
```
<type>/<SCRUM-id>/<SCRUM-id>-short-description
```

**Examples**:
```
feature/SCRUM-54/SCRUM-60-listado-eventos-service
fix/SCRUM-87/SCRUM-88-fix-event-detail-date
```

**Note**: Each branch should correspond to a Jira subtask. If you don't have a Jira ID, use a descriptive name without the ID (e.g., `feature/setup-eslint`).

### Pull Request Process

1. Create a feature branch from `main`.
2. Commit with conventional format (enforced by `commit-lint` workflow).
3. Push and open a PR against `main`.
4. Ensure:
   - All status checks pass (linting, tests, commit lint).
   - At least 1 approval from a team member.
   - All conversations resolved.
5. Merge with a **merge commit** (no squash).

## Testing

Both applications use automated testing to ensure quality. Tests must pass before merging to `main`.

### Angular (Jest)

```bash
cd gfticket-angular

# Run all tests
npm test

# Run with coverage report
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- event-catalog.spec.ts
```

**Coverage expectations**: Aim for >80% overall. All components and services should have unit tests written **before implementation** (TDD approach).

**Test file location**: Co-locate with source files. E.g., `event-catalog.ts` and `event-catalog.spec.ts` in the same folder.

### React (Vitest)

```bash
cd gfticket-react

# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

## Architecture & Patterns

### Angular App

**Structure**: Standalone components (Angular 14+ style, no NgModules).

**Key Patterns**:
- **Services**: Use dependency injection for API calls and business logic. Example: `EventService` fetches events from the backend.
- **Components**: Presentational components receive data via `@Input()` and emit actions via `@Output()`. Container/smart components manage state and call services.
- **Routing**: Defined in `app.routes.ts`. Lazy-loaded components where applicable.
- **Styling**: Component-scoped CSS files + global `styles.css`. Uses a dark theme with OKLCH color system.

**Example component structure**:
```
src/app/components/event-catalog/
├── event-catalog.ts          # Component definition
├── event-catalog.html        # Template
├── event-catalog.css         # Styles
└── event-catalog.spec.ts     # Unit tests
```

### React App

**Structure**: Functional components with hooks.

**Key Patterns**:
- **Services**: Custom hooks for API calls (e.g., `useEventService()`).
- **State Management**: React hooks (`useState`, `useContext`) for local/global state.
- **Components**: Atomic design approach (atoms, molecules, organisms).
- **Styling**: CSS-in-JS or scoped CSS modules.

## API Integration

Both apps consume a **shared backend REST API**. The API is already deployed and maintained by a separate team.

**Base URL** (from environment config):
```
https://api.gfticket.example.com/v1
```

**Key endpoints** (used by frontend):
- `GET /eventos` — List all events
- `GET /eventos/:id` — Get event detail
- `POST /eventos` — Create event (admin only)
- `PUT /eventos/:id` — Update event (admin only)
- `DELETE /eventos/:id` — Delete event (admin only)

**API Integration in code**:
- Angular: Use `HttpClient` (injected in services).
- React: Use `fetch()` or axios inside hooks/services.

**No mocks in development** — always use the real API. This ensures frontend and backend are tested together early.

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
3. ✅ Unit tests are written (spec file exists, tests pass).
4. ✅ CSS/design is responsive (mobile, tablet, desktop).
5. ✅ Necessary documentation is updated.
6. ✅ Code is committed with proper message and pushed.
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
3. **Implement the feature** (code + tests + CSS).
4. **Verify locally**: dev server runs, tests pass, responsive design works.
5. **Commit and push** with a conventional message.
6. **Open a PR** against `main` and request review.
7. **Address feedback** and merge when approved.

For questions about technical decisions or architecture, ask your Scrum Master or team lead. The backend API documentation is available at [link-to-API-docs] (if applicable).

## Team

- **Pau Greus** (Scrum Master, Angular developer)
- **Alejandro** (Angular developer)
- **Jorge** (React developer)

Each person owns their app(s) and reviews PRs in their area.

## License

ISC

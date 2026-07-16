# GFTicket Angular - Public Web Application

The public-facing web application for **GFTicket**, a live event ticket sales platform. This app allows users to browse events, view event details, register, and purchase tickets.

**Tech Stack**: Angular 22 (standalone components) · TypeScript · Jest · OKLCH color system · Responsive CSS.

## Features

- 📋 **Event Listing**: Browse all upcoming events with filtering by genre, date, location.
- 🎫 **Event Detail**: View full event information (date, time, venue, price range, description).
- 👤 **User Registration & Login**: Create an account and authenticate (Sprint 2+).
- 🛒 **Purchase Flow**: Simulate ticket purchase and show confirmation (Sprint 2+).
- 👥 **User Profile**: View/edit user information and purchase history (Sprint 3+).
- 🎨 **Responsive Design**: Fully responsive from mobile (375px) to desktop (1440px+).

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+.
- Familiarity with Angular, TypeScript, and async/await.

### Installation

```bash
# From the gfticket-angular directory:
npm install
```

This installs all dependencies including Angular CLI, Jest, and dev tools.

### Development Server

```bash
npm start
# or: ng serve
```

Open `http://localhost:4200` in your browser. The app reloads on file changes (HMR enabled).

### Build for Production

```bash
npm run build
```

Output is in `dist/gfticket-angular/`. Optimized and minified for production.

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   └── event-catalog/
│   │       ├── event-catalog.ts           # Component definition
│   │       ├── event-catalog.html         # Template (grid of event cards)
│   │       ├── event-catalog.css          # Card styling
│   │       └── event-catalog.spec.ts      # Tests
│   ├── pages/
│   │   ├── event-list/                    # Event listing page (container)
│   │   │   ├── event-list.ts
│   │   │   ├── event-list.html
│   │   │   ├── event-list.css             # Page layout + skeleton states
│   │   │   └── event-list.spec.ts
│   │   ├── event-detail/                  # Event detail page
│   │   │   ├── event-detail.ts
│   │   │   ├── event-detail.html
│   │   │   ├── event-detail.css
│   │   │   └── event-detail.spec.ts
│   │   └── public-home/                   # Landing page (future)
│   ├── services/
│   │   └── event.service.ts               # API calls for events
│   │       └── event.service.spec.ts      # Service tests
│   ├── models/
│   │   └── event.model.ts                 # EventModel interface
│   ├── app.routes.ts                      # Application routing (standalone)
│   ├── app.ts                             # Root component
│   └── app.config.ts                      # Global app config (providers, etc.)
├── styles.css                             # Global styles (reset, variables)
├── index.html                             # Entry point
└── main.ts                                # Bootstrap application

jest.config.js                             # Jest configuration
angular.json                               # Angular CLI config
tsconfig.json                              # TypeScript config
```

## Architecture & Design Patterns

### Standalone Components

All components are **standalone** (no NgModules). Each component declares its own imports:

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-event-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-catalog.html',
  styleUrl: './event-catalog.css',
})
export class EventCatalog {
  @Input() events: EventModel[] = [];
}
```

### Services & Dependency Injection

Business logic (API calls, data transformations) lives in services. Inject them into components:

```typescript
import { EventService } from '../../services/event.service';

export class EventList implements OnInit {
  private readonly eventService = inject(EventService);

  events: EventModel[] = [];
  loading = true;
  error = false;

  ngOnInit(): void {
    this.eventService.getEventos().subscribe({
      next: (events) => {
        this.events = events;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }
}
```

### Routing

Routes are defined in `app.routes.ts` and lazy-loaded where applicable:

```typescript
export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/public-home/public-home').then(m => m.PublicHome) },
  { path: 'eventos', loadComponent: () => import('./pages/event-list/event-list').then(m => m.EventList) },
  { path: 'eventos/:id', loadComponent: () => import('./pages/event-detail/event-detail').then(m => m.EventDetail) },
];
```

### Styling & Design System

**Color Palette** (OKLCH format, dark theme):
- Background: `oklch(0.16 0.015 280)` (very dark blue)
- Surface: `oklch(0.21 0.02 280)` (dark blue for cards)
- Accent (primary): `oklch(0.72 0.22 350)` (magenta/pink)
- Accent 2 (secondary): `oklch(0.88 0.19 128)` (lime green for tags)
- Text: `oklch(0.97 0.005 280)` (off-white)
- Muted text: `oklch(0.68 0.02 280)` (gray)

**Fonts**:
- Headings: `Space Grotesk` (700–800 weight)
- Body: `Manrope` (400–600 weight)
- Monospace (code): `monospace` (fallback)

Fonts are loaded via Google Fonts in `index.html`. All CSS uses these variables for consistency.

## Testing

Tests are written using **Jest** + `jest-preset-angular`. A test must exist for every component and service.

### Running Tests

```bash
# Run all tests with coverage report
npm test -- --coverage

# Run tests in watch mode (re-run on file changes)
npm test -- --watch

# Run a specific test file
npm test -- event-catalog.spec.ts

# Run tests without coverage (faster for local development)
npm test -- --no-coverage
```

### Writing Tests (TDD)

1. **Write the test first** — describe the expected behavior.
2. **Run and watch it fail** — confirm the test is correct.
3. **Implement the feature** — make the test pass.
4. **Refactor** — improve code quality while keeping tests green.

**Example component test**:
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventCatalog } from './event-catalog';

describe('EventCatalog', () => {
  let component: EventCatalog;
  let fixture: ComponentFixture<EventCatalog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventCatalog],
    }).compileComponents();

    fixture = TestBed.createComponent(EventCatalog);
    component = fixture.componentInstance;
  });

  it('should render one card per event', () => {
    component.events = [mockEvent1, mockEvent2];
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.event-card');
    expect(cards.length).toBe(2);
  });

  it('should display event name and price', () => {
    component.events = [mockEvent];
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain(mockEvent.nombre);
    expect(text).toContain(`${mockEvent.precioMinimo} €`);
  });
});
```

**Coverage expectations**: Aim for >80% overall. Key metrics:
- **Statements**: Code lines executed.
- **Branches**: If/else paths covered.
- **Functions**: All functions tested.
- **Lines**: All lines executed.

## API Integration

The app consumes a **backend REST API** (maintained by a separate team). No mocks are used — always test against the real API.

### Endpoints Used

```
GET /eventos           → EventList page, EventCatalog component
GET /eventos/:id       → EventDetail page
POST /usuarios         → User registration (Sprint 2+)
POST /compras          → Simulate ticket purchase (Sprint 2+)
GET /usuarios/:id      → User profile (Sprint 3+)
```

### EventService

All API calls go through `event.service.ts`:

```typescript
export class EventService {
  constructor(private http: HttpClient) {}

  getEventos(): Observable<EventModel[]> {
    return this.http.get<EventModel[]>(`${API_BASE}/eventos`);
  }

  getEventById(id: string): Observable<EventModel> {
    return this.http.get<EventModel>(`${API_BASE}/eventos/${id}`);
  }
}
```

Inject it into components and subscribe to the observables. Use the `async` pipe in templates for automatic unsubscription:

```html
<div *ngIf="(events$ | async) as events">
  <app-event-catalog [events]="events" />
</div>
```

## Responsive Design

The app is **mobile-first** and responsive from 375px (mobile) to 1440px+ (desktop).

### Breakpoints

- **Mobile**: 320–640px
- **Tablet**: 640–1024px
- **Desktop**: 1024px+

Use CSS media queries in component styles:

```css
.event-card {
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .event-card {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .event-card {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

Test on real devices or use browser DevTools to simulate different screen sizes.

## Loading States (Skeletons)

Pages show skeleton screens while data is loading:

```typescript
export class EventList {
  loading = true;
  events: EventModel[] = [];

  ngOnInit(): void {
    this.eventService.getEventos().subscribe({
      next: (events) => {
        this.events = events;
        this.loading = false;
      },
    });
  }
}
```

Template:
```html
@if (loading) {
  <div class="skeleton-grid">
    <!-- Skeleton cards here -->
  </div>
} @else {
  <app-event-catalog [events]="events" />
}
```

Skeleton styles mimic the real component's layout and animate with a pulse effect to indicate loading.

## Development Tips

### Use Angular DevTools
Install the [Angular DevTools](https://chrome.google.com/webstore/detail/angular-devtools/) Chrome extension to inspect component trees, change detection, and performance.

### Enable Source Maps
During development, source maps allow debugging TypeScript directly in DevTools:

```bash
ng serve --source-map
```

### Debug in VS Code
Add a launch configuration to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "attach",
      "name": "Attach Karma Chrome",
      "address": "localhost",
      "port": 9333,
      "pathMapping": {
        "/": "${workspaceRoot}/",
        "/base/": "${workspaceRoot}/"
      }
    }
  ]
}
```

Then run tests with `npm test` and attach the debugger.

## Troubleshooting

### Port 4200 Already in Use
```bash
ng serve --port 4201
```

### Tests Fail After Installing Packages
```bash
rm -rf node_modules package-lock.json
npm install
npm test
```

### HMR Not Reloading
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac).
- Stop the dev server and restart: Ctrl+C, then `npm start`.

### Import Errors After Moving Files
- Angular CLI should auto-update imports, but sometimes it misses. Manually check `import` statements.
- Restart the dev server: changes to file structure require a restart.

### Async Pipe Not Updating
- Ensure you're using `async` pipe: `{{ data$ | async }}`.
- Avoid storing observables in variables — subscribe explicitly or use `async`.

## Performance Tips

1. **Lazy Load Routes**: Use dynamic imports in routes to split code:
   ```typescript
   {
     path: 'eventos/:id',
     loadComponent: () => import('./pages/event-detail/event-detail').then(m => m.EventDetail),
   }
   ```

2. **OnPush Change Detection**: Mark components that only depend on inputs:
   ```typescript
   @Component({
     changeDetection: ChangeDetectionStrategy.OnPush,
     ...
   })
   ```

3. **Track by in *ngFor**: Improve list rendering performance:
   ```html
   @for (event of events; track event.id) {
     <app-event-card [event]="event" />
   }
   ```

4. **Unsubscribe from Observables**: Use `takeUntilDestroyed()` to avoid memory leaks:
   ```typescript
   this.eventService.getEventos()
     .pipe(takeUntilDestroyed())
     .subscribe((events) => { ... });
   ```

## Further Resources

- [Angular Docs](https://angular.dev)
- [Angular Best Practices](https://angular.dev/guide/styleguide)
- [Jest Testing](https://jestjs.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [OKLCH Colors](https://oklch.com/) — interactively explore the color palette.

## Contributing

See the **main README** in the repository root for Git conventions, PR process, and team info.

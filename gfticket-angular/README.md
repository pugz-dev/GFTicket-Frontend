# GFTicket Angular - Public Web Application

The public-facing web application for **GFTicket**, a live event ticket sales platform. Lets users browse events, register/log in, edit their profile, simulate a ticket purchase, and see the tickets they've bought.

**Tech Stack**: Angular 22+ (standalone components, signals, `@if`/`@for` control flow) · TypeScript · Jest (`jest-preset-angular`) · OKLCH dark theme · Responsive CSS.

## Features

- 🔎 **Event Catalog**: browse all events, filter by name, locality and genre (client-side, over the full event list).
- 🎫 **Event Detail**: full event info (date, time, venue, price range, description) with skeleton loading and an error state.
- 👤 **Registration & Login**: create an account and authenticate — simulated entirely in `localStorage` (no backend auth endpoint).
- ✏️ **Profile**: view and edit your own name/surname/email/phone.
- 🛒 **Purchase Flow**: pick a card, submit it to the real payment gateway (`POST /pasarela/compra`), see a friendly confirmation or error.
- ⚡ **Fast Purchase**: a "Comprar" button directly on each catalog card for logged-in users, skipping the event detail page.
- 📜 **Mis Entradas**: logged-in users can see every ticket they've bought — event name, event date, purchase date, price paid.
- 🎨 **Responsive, dark, OKLCH-based design**, consistent across every page.

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+.
- Familiarity with Angular, TypeScript, and RxJS observables.

### Installation

```bash
# From the gfticket-angular directory:
npm install
```

### Development Server

```bash
npm start
# or: ng serve
```

Open `http://localhost:4200`. The app reloads on file changes (HMR enabled).

### Build for Production

```bash
npm run build
```

Output is in `dist/gfticket-angular/`.

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── event-catalog/         # Grid of event cards (+ "Comprar" button when logged in)
│   │   └── event-list/            # Owns loading/error state, search + locality/genre filters,
│   │                               # renders <app-event-catalog>, and the topbar user menu
│   ├── pages/
│   │   ├── public-home/           # "/" — renders <app-event-list />
│   │   ├── event-detail/          # "/eventos/:id"
│   │   ├── register/              # "/registro"
│   │   ├── login/                 # "/login"
│   │   ├── perfil/                # "/perfil" (guarded) — edit own profile
│   │   ├── cart/                  # "/carrito/:id" (guarded) — card form, calls PurchaseService
│   │   ├── confirmation-purchase/ # "/confirmacion" — success/error message after a purchase
│   │   └── mis-entradas/          # "/mis-entradas" — tickets bought by the logged-in user
│   ├── services/
│   │   ├── event.service.ts       # GET /eventos, GET /eventos/:id (normalizes negative prices)
│   │   ├── purchase.service.ts    # POST /pasarela/compra + gateway error-code → friendly message
│   │   ├── auth.service.ts        # login/logout, exposes usuarioActual as a signal
│   │   └── user-storage.service.ts# simulated users/sessions/purchased tickets in localStorage
│   ├── guards/
│   │   └── auth.guard.ts          # canActivate — redirects to /login when there's no session
│   ├── models/                    # EventModel, UserModel, TicketModel, CardDataModel,
│   │                               # TicketPurchaseModel
│   ├── app.routes.ts              # Application routing (standalone, lazy-loaded)
│   ├── app.ts                     # Root component
│   └── app.config.ts              # Global providers (HttpClient, Router, app initializer that
│                                   #   seeds test users on first load)
├── environments/                  # apiUrl per environment
├── styles.css                     # Global reset + font imports
├── index.html
└── main.ts

jest.config.js                     # Jest config + per-folder coverage thresholds
angular.json
tsconfig.json
```

## Architecture & Design Patterns

### Standalone Components

Every component is **standalone** (no NgModules) and declares its own `imports`:

```typescript
@Component({
  selector: 'app-event-catalog',
  imports: [RouterLink],
  templateUrl: './event-catalog.html',
  styleUrl: './event-catalog.css',
})
export class EventCatalog {
  @Input() events: EventModel[] = [];
}
```

### Services & Dependency Injection

Business logic lives in services, injected with `inject()`:

```typescript
export class EventList implements OnInit {
  private readonly eventService = inject(EventService);
  readonly authService = inject(AuthService);

  allEvents: EventModel[] = [];
  filteredEvents: EventModel[] = [];
  loading = true;
  error = false;

  ngOnInit(): void {
    this.eventService.getEventos().subscribe({
      next: (events) => { this.allEvents = events; this.filteredEvents = events; this.loading = false; },
      error: () => { this.error = true; this.loading = false; },
    });
  }
}
```

`EventList` is a **component**, not a page — it owns loading/error state and the search/filter logic, and renders `<app-event-catalog>` internally. `PublicHome` just renders `<app-event-list />`.

### Auth: simulated client-side, exposed as a signal

There is no backend auth endpoint. `UserStorageService` keeps the user list (and their purchased tickets) in `localStorage`; `AuthService` wraps it and exposes the logged-in user as a **signal**, read directly in templates:

```typescript
export class AuthService {
  private readonly usuarioActualSignal = signal<UserModel | null>(this.resolveUsuarioActual());
  readonly usuarioActual = this.usuarioActualSignal.asReadonly();
  // loginUsuario(), logout(), estaAutenticado(), actualizarUsuarioActual()
}
```

```html
@if (authService.usuarioActual(); as usuario) {
  <span>{{ usuario.nombre }}</span>
}
```

### Routing & Guards

Routes live in `app.routes.ts`, lazy-loaded via `loadComponent`. Routes that require a session use the functional `authGuard`:

```typescript
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.estaAutenticado() || router.parseUrl('/login');
};
```

```typescript
{ path: 'carrito/:id', loadComponent: () => import('./pages/cart/cart').then(m => m.Cart), canActivate: [authGuard] }
```

### Styling & Design System

**Color Palette** (OKLCH format, dark theme — declared as CSS custom properties on `:host` in every component):
- Background: `oklch(0.16 0.015 280)`
- Surface (cards): `oklch(0.21 0.02 280)`
- Border: `oklch(0.32 0.02 280)`
- Accent (primary, pink/magenta): `oklch(74.317% 0.1231 345.36)`
- Accent 2 (secondary, lime — genre tags): `oklch(0.88 0.19 128)`
- Text: `oklch(0.97 0.005 280)`
- Muted text: `oklch(0.68 0.02 280)`

**Fonts**: `Space Grotesk` (700–800 weight, headings/buttons/prices) and `Manrope` (400–600, body text), loaded via Google Fonts in `index.html`.

## Testing

Tests are written with **Jest** + `jest-preset-angular`, co-located with source files (`event-catalog.ts` / `event-catalog.spec.ts`).

### Running Tests

```bash
npm test                              # Run all tests with coverage
npm test -- src/app/pages/cart        # Run tests under a specific folder
npm test -- --watch                   # Watch mode
```

### Writing Tests (TDD)

1. **Write the test first** — describe the expected behavior.
2. **Run and watch it fail** — confirm the test is correct.
3. **Implement the feature** — make the test pass.
4. **Refactor** — improve code quality while keeping tests green.

**Example — mocking a service and asserting on the DOM**:
```typescript
describe('EventCatalog', () => {
  let fixture: ComponentFixture<EventCatalog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [EventCatalog], providers: [provideRouter([])] })
      .compileComponents();
    fixture = TestBed.createComponent(EventCatalog);
  });

  it('renders one card per event', () => {
    fixture.componentRef.setInput('events', [mockEvent1, mockEvent2]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.event-card').length).toBe(2);
  });
});
```

**Coverage thresholds** (enforced in `jest.config.js`):
- `src/app/services/**`: 70% branches/functions/lines/statements.
- `src/app/components/**`: 50%.

Routes that use `[routerLink]` in a test need a matching route registered in `provideRouter([...])` (a stub component is enough) — otherwise Angular Router throws `NG04002` when computing the link.

## API Integration

The app consumes a **backend REST API** (a "TeacherBanking" academic environment, maintained by a separate team). No mocks — always test against the real API.

### Endpoints Used

```
GET  /eventos            → EventService.getEventos()      (EventList / EventCatalog)
GET  /eventos/:id        → EventService.getEventById()     (EventDetail, Cart)
POST /pasarela/compra    → PurchaseService.compraEntradas()(Cart, on submit)
```

`EventService` normalizes `precioMinimo`/`precioMaximo` with `Math.abs()` on every response — the backend has occasionally returned negative prices.

There is **no backend endpoint for users** — registration, login, profile edits, and purchased tickets are all persisted in `localStorage` via `UserStorageService`.

### PurchaseService

```typescript
export class PurchaseService {
  compraEntradas(purchase: TicketPurchaseModel, event: EventModel, cantidad: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/pasarela/compra`, { ...purchase.cardData, emisor: 'GFTicket', concepto: event.nombre, cantidad: String(cantidad) });
  }

  getMensajeError(codigoError: string): string { /* maps gateway error codes to a friendly Spanish message */ }
}
```

`generarImporteCompra(event)` (exported from the same file) picks a random amount within the event's price range — computed once in `Cart` so the same value can be sent to the gateway **and** stored in the user's ticket history.

## Responsive Design

Mobile-first, responsive from ~375px (mobile) to 1440px+ (desktop). Each component declares its own breakpoints in its `.css` file, e.g.:

```css
.entradas-grid { display: flex; flex-direction: column; gap: 16px; }

@media (min-width: 640px) {
  .skeleton-grid { grid-template-columns: repeat(2, 1fr); }
}
```

Test on real devices or browser DevTools device emulation.

## Loading & Error States

Pages that fetch data show a skeleton while loading and a dedicated error state (icon, message, retry action where it makes sense) instead of a blank screen or raw error text:

```html
@if (loading) {
  <div class="skeleton-grid"> <!-- skeleton cards --> </div>
} @else if (error) {
  <div class="state state--error">
    <p class="state__message">Ha ocurrido un error al conectar con el servidor...</p>
    <button (click)="reintentar()">Reintentar</button>
  </div>
} @else {
  <app-event-catalog [events]="filteredEvents" />
}
```

## Development Tips

### Angular DevTools
Install the [Angular DevTools](https://chrome.google.com/webstore/detail/angular-devtools/) Chrome extension to inspect the component tree, signals, and change detection.

### Debugging Jest tests in VS Code
Add a launch configuration targeting `node_modules/.bin/jest` with `--runInBand`, or use the [Jest extension](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest) for inline pass/fail and one-click debugging.

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

### `NG04002: Cannot match any routes` in a test
A `[routerLink]` in the component under test points to a route that isn't registered in that spec's `provideRouter([...])`. Add a stub route (a trivial `@Component({ template: '' })` is enough) for the path being linked to.

### A test I didn't touch suddenly fails after adding a sibling element
If you added a second element with the same class as one a test already `querySelector`s (e.g. a second `.topbar__menu-item`), that selector now returns a different element. Give the new element (or the existing one) a more specific class instead of relying on DOM order.

## Further Resources

- [Angular Docs](https://angular.dev)
- [Angular Best Practices](https://angular.dev/guide/styleguide)
- [Jest Testing](https://jestjs.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [OKLCH Colors](https://oklch.com/) — interactively explore the color palette.

## Contributing

See the **main README** in the repository root for Git conventions, PR process, and team info.

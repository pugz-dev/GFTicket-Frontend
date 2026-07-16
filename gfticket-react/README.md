# GFTicket React - Admin Panel

The admin dashboard for **GFTicket**, a live event ticket sales platform. This app allows administrators to manage events: create, read, update, and delete events (full CRUD operations).

**Tech Stack**: React 18 · Vite · Vitest · JavaScript/JSX · Responsive CSS.

## Features

- 📋 **Event Management**: View all events in a table or grid.
- ➕ **Create Events**: Form to add new events with details (name, date, price, image, etc.).
- ✏️ **Edit Events**: Modify existing event information.
- 🗑️ **Delete Events**: Remove events from the system (with confirmation).
- 🔍 **Search & Filter**: Filter events by genre, date, location.
- 📊 **Event Statistics**: View basic analytics (total events, upcoming events, etc.).
- 🎨 **Responsive Design**: Works on desktop, tablet, and mobile.

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+.
- Familiarity with React hooks, JSX, and async/await.

### Installation

```bash
# From the gfticket-react directory:
npm install
```

This installs React, Vite, Vitest, and all dependencies.

### Development Server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser. The app reloads on file changes (Vite HMR).

### Build for Production

```bash
npm run build
```

Output is in `dist/`. Optimized and minified for production.

### Linting

```bash
npm run lint
```

Runs ESLint to check code style and catch common errors.

## Project Structure

```
src/
├── components/
│   ├── EventList/
│   │   ├── EventList.jsx              # List of events (table or grid)
│   │   ├── EventList.css              # Styling
│   │   └── EventList.test.jsx          # Tests
│   ├── EventForm/
│   │   ├── EventForm.jsx              # Create/Edit event form
│   │   ├── EventForm.css
│   │   └── EventForm.test.jsx
│   ├── EventDetailComponent/
│   │   ├── EventDetailComponent.jsx   # Event detail modal/page
│   │   ├── EventDetailComponent.css
│   │   └── EventDetailComponent.test.jsx
│   └── common/
│       ├── Button.jsx
│       ├── Modal.jsx                  # Reusable modal component
│       └── LoadingSpinner.jsx
├── services/
│   ├── eventService.js                # API calls (fetch events, create, update, delete)
│   └── eventService.test.js           # Service tests
├── hooks/
│   ├── useEvents.js                   # Custom hook for event management
│   └── useEventForm.js                # Custom hook for form state
├── App.jsx                            # Root component, routing
├── App.css                            # Global styles
├── main.jsx                           # Entry point
└── index.css                          # Global reset styles

vite.config.js                         # Vite configuration
vitest.config.js                       # Vitest configuration (if separate)
package.json
```

## Architecture & Design Patterns

### Functional Components with Hooks

All components are **functional** (not class-based) and use React hooks:

```javascript
import { useState, useEffect } from 'react';

export function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const response = await fetch('/api/eventos');
      const data = await response.json();
      setEvents(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="event-list">
      {events.map((event) => (
        <EventCard key={event.id} event={event} onDelete={handleDelete} />
      ))}
    </div>
  );
}
```

### Custom Hooks

Extract reusable logic into custom hooks:

```javascript
// hooks/useEvents.js
import { useState, useEffect } from 'react';

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetch('/api/eventos');
      const data = await response.json();
      setEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const createEvent = async (eventData) => {
    const response = await fetch('/api/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    const newEvent = await response.json();
    setEvents([...events, newEvent]);
    return newEvent;
  };

  const deleteEvent = async (id) => {
    await fetch(`/api/eventos/${id}`, { method: 'DELETE' });
    setEvents(events.filter((e) => e.id !== id));
  };

  return { events, loading, createEvent, deleteEvent };
}
```

Then use it in components:
```javascript
export function EventList() {
  const { events, loading, deleteEvent } = useEvents();
  // ...
}
```

### Services Layer

API calls are centralized in `services/eventService.js`:

```javascript
// services/eventService.js
const API_BASE = process.env.REACT_APP_API_BASE || 'https://api.gfticket.example.com/v1';

export async function fetchAllEvents() {
  const response = await fetch(`${API_BASE}/eventos`);
  if (!response.ok) throw new Error('Failed to fetch events');
  return response.json();
}

export async function fetchEventById(id) {
  const response = await fetch(`${API_BASE}/eventos/${id}`);
  if (!response.ok) throw new Error(`Event ${id} not found`);
  return response.json();
}

export async function createEvent(eventData) {
  const response = await fetch(`${API_BASE}/eventos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  if (!response.ok) throw new Error('Failed to create event');
  return response.json();
}

export async function updateEvent(id, eventData) {
  const response = await fetch(`${API_BASE}/eventos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  if (!response.ok) throw new Error('Failed to update event');
  return response.json();
}

export async function deleteEvent(id) {
  const response = await fetch(`${API_BASE}/eventos/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete event');
}
```

Then import and use in components or hooks.

## Testing

Tests are written using **Vitest** (Vite's built-in test runner) + React Testing Library.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-run on file changes)
npm test -- --watch

# Run a specific test file
npm test -- EventList.test.jsx

# Run with coverage report
npm test -- --coverage

# Run a single test by name
npm test -- --t "should create an event"
```

### Writing Tests (TDD)

1. **Write the test first** — describe the expected behavior.
2. **Run and watch it fail** — confirm the test is correct.
3. **Implement the feature** — make the test pass.
4. **Refactor** — improve code quality while keeping tests green.

**Example component test**:
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { EventList } from './EventList';

describe('EventList', () => {
  it('should render a list of events', () => {
    const mockEvents = [
      { id: 1, nombre: 'Event 1', precioMinimo: 20 },
      { id: 2, nombre: 'Event 2', precioMinimo: 30 },
    ];
    
    render(<EventList events={mockEvents} />);
    
    expect(screen.getByText('Event 1')).toBeInTheDocument();
    expect(screen.getByText('Event 2')).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked', async () => {
    const mockOnDelete = jest.fn();
    const event = { id: 1, nombre: 'Event 1', precioMinimo: 20 };
    
    render(<EventList events={[event]} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });
});
```

**Service test**:
```javascript
import { fetchAllEvents, createEvent } from './eventService';

describe('eventService', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should fetch all events', async () => {
    const mockEvents = [
      { id: 1, nombre: 'Event 1' },
      { id: 2, nombre: 'Event 2' },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEvents,
    });

    const events = await fetchAllEvents();
    expect(events).toEqual(mockEvents);
  });

  it('should create a new event', async () => {
    const newEvent = { nombre: 'New Event', precioMinimo: 50 };
    const responseEvent = { id: 3, ...newEvent };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => responseEvent,
    });

    const result = await createEvent(newEvent);
    expect(result).toEqual(responseEvent);
  });
});
```

**Coverage expectations**: Aim for >80% overall.

## Styling

The admin panel uses **scoped CSS** (each component has its own CSS file) and follows a consistent design.

### CSS Variables & Color System

Define colors in `App.css` for consistency:

```css
:root {
  --color-bg: #0f0f1e;
  --color-surface: #1a1a2e;
  --color-border: #16213e;
  --color-text: #f5f5f5;
  --color-accent: #ff006e;
  --color-accent-2: #d4ff00;
  --color-error: #c41e3a;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}
```

Then use in component files:

```css
/* components/EventList/EventList.css */
.event-list {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 20px;
}

.event-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}

.event-item:last-child {
  border-bottom: none;
}

.delete-btn {
  background-color: var(--color-error);
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn:hover {
  opacity: 0.9;
}
```

## Responsive Design

Use CSS media queries for responsive layouts:

```css
/* Desktop */
.event-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* Tablet */
@media (max-width: 1024px) {
  .event-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile */
@media (max-width: 640px) {
  .event-list {
    grid-template-columns: 1fr;
  }
}
```

Test on real devices or use browser DevTools mobile emulation.

## API Integration

The app consumes the **backend REST API** (maintained by a separate team). No mocks are used in production — always test against the real API.

### Environment Configuration

Create a `.env` file in the root:

```
VITE_API_BASE=https://api.gfticket.example.com/v1
```

Then access in your code:

```javascript
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
```

### Endpoints Used

```
GET /eventos           → Fetch all events
GET /eventos/:id       → Fetch event detail
POST /eventos          → Create new event
PUT /eventos/:id       → Update existing event
DELETE /eventos/:id    → Delete event
```

All API calls go through `services/eventService.js` for consistency.

## Performance Tips

1. **Lazy Load Routes**: Use React Router's lazy loading:
   ```javascript
   const EventDetail = lazy(() => import('./pages/EventDetail'));
   
   <Suspense fallback={<LoadingSpinner />}>
     <Routes>
       <Route path="/eventos/:id" element={<EventDetail />} />
     </Routes>
   </Suspense>
   ```

2. **Memoize Components**: Prevent unnecessary re-renders:
   ```javascript
   import { memo } from 'react';
   
   const EventCard = memo(({ event, onDelete }) => (
     <div className="event-card">
       {/* ... */}
     </div>
   ));
   ```

3. **useMemo & useCallback**: Cache expensive computations and functions:
   ```javascript
   import { useMemo, useCallback } from 'react';
   
   const filteredEvents = useMemo(() => {
     return events.filter((e) => e.genre === selectedGenre);
   }, [events, selectedGenre]);
   
   const handleDelete = useCallback((id) => {
     deleteEvent(id);
   }, []);
   ```

4. **Code Splitting**: Vite automatically splits code by route. Import dynamic components:
   ```javascript
   const EventForm = lazy(() => import('./components/EventForm'));
   ```

## Development Tips

### Environment Variables

Create `.env` (for development) and `.env.production` (for production):

```
# .env
VITE_API_BASE=http://localhost:3000/api
VITE_LOG_LEVEL=debug

# .env.production
VITE_API_BASE=https://api.gfticket.example.com/v1
VITE_LOG_LEVEL=error
```

Access via `import.meta.env.VITE_*`.

### Debug in Browser

1. Install [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/) Chrome extension.
2. Open DevTools and use the "Components" tab to inspect component tree.
3. Use the "Profiler" tab to find performance bottlenecks.

### Live Reload

Vite provides instant HMR (Hot Module Replacement) — file changes reload the app in <100ms. No manual refresh needed.

## Troubleshooting

### Port 5173 Already in Use
```bash
npm run dev -- --port 5174
```

### Tests Fail After Installing Packages
```bash
rm -rf node_modules package-lock.json
npm install
npm test
```

### HMR Not Reloading
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac).
- Stop dev server and restart: Ctrl+C, then `npm run dev`.

### Fetch Errors / CORS Issues
- Ensure the backend API is running.
- Check `VITE_API_BASE` environment variable.
- In development, the backend may need CORS headers enabled.

### Module Not Found
- Ensure relative paths are correct: `../services/eventService` not `./services/eventService`.
- Restart dev server after adding new files/folders.

## Further Resources

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev/)
- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [JavaScript.info](https://javascript.info/) — modern JavaScript basics.

## Contributing

See the **main README** in the repository root for Git conventions, PR process, and team info.

---

**Questions?** Ask Jorge or your Scrum Master. Happy coding! 🚀

# EventService — Unit Test Plan (defined before implementation)

**Method under test:** `getEventos()`

## Test 1 — Success

- **Name:** `getEventos_shouldReturnEventList_whenRequestSucceeds`
- **Description:** Calls `getEventos()` simulating that the API responds with a list of events.
- **Expected result:** The method returns that same list of events.

## Test 2 — Error

- **Name:** `getEventos_shouldPropagateError_whenRequestFails`
- **Description:** Calls `getEventos()` simulating that the API responds with an error (e.g. HTTP 500).
- **Expected result:** The observable emits an error; it does not silently return `null` or an empty list.

## Test 3 — Correct URL

- **Name:** `getEventos_shouldCallCorrectUrl`
- **Description:** Calls `getEventos()` and inspects the HTTP request made.
- **Expected result:** The request is sent to `${environment.apiUrl}/eventos`.

## Test 4 — Empty result

- **Name:** `getEventos_shouldReturnEmptyArray_whenApiReturnsNoEvents`
- **Description:** Calls `getEventos()` simulating that the API responds with an empty array.
- **Expected result:** The method returns `[]`, not treated as an error.

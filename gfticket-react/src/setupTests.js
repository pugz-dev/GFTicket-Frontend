//Registers @testing-library/jest-dom matchers (toBeInTheDocument, toHaveValue, ...) with Vitest's expect
import '@testing-library/jest-dom/vitest';

//Unmount rendered components after every test. Testing Library only does this
//automatically when the runner exposes a global afterEach, which Vitest does not
//by default (globals: false) — without it, renders accumulate across tests.
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());

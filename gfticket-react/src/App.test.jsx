// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('should render the app title', () => {
    render(<App />);
    
    const titleElement = screen.getByText(/Gfticket works/);
    expect(titleElement).toBeTruthy();
  });
});
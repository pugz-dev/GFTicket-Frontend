// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageNotFound } from './PageNotFound';

import { MemoryRouter } from 'react-router-dom';
//The component renders <Link>, which needs a Router in scope
const renderList = () =>
    render(<PageNotFound />, { wrapper: MemoryRouter });

describe('PageNotFound Component', () => {
  it('should render a 404 message', () => {
    renderList();
    
    const messageElement = screen.getByRole('heading', {level: 2, name: '404 - Página no encontrada'});
    expect(messageElement).toBeInTheDocument();
  });
});
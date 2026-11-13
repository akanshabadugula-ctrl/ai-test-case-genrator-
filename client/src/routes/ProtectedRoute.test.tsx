import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuthStore } from '../store/authStore';

describe('ProtectedRoute', () => {
  it('redirects anonymous users to sign in', () => {
    useAuthStore.setState({ user: null, status: 'anonymous', error: null });
    render(<MemoryRouter initialEntries={['/app']}><Routes><Route path="/login" element={<p>Sign in page</p>} /><Route element={<ProtectedRoute />}><Route path="/app" element={<p>Private workspace</p>} /></Route></Routes></MemoryRouter>);
    expect(screen.getByText('Sign in page')).toBeInTheDocument();
    expect(screen.queryByText('Private workspace')).not.toBeInTheDocument();
  });

  it('shows an accessible session restoration state', () => {
    useAuthStore.setState({ user: null, status: 'loading', error: null });
    render(<MemoryRouter><ProtectedRoute /></MemoryRouter>);
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
  });
});

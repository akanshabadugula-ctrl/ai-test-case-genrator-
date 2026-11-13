import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { useAuthStore } from '../store/authStore';

describe('LoginPage', () => {
  it('submits credentials through auth state and navigates to the workspace', async () => {
    const login = vi.fn().mockResolvedValue(undefined);
    useAuthStore.setState({ user: null, status: 'anonymous', error: null, login });
    render(<MemoryRouter initialEntries={['/login']}><Routes><Route path="/login" element={<LoginPage />} /><Route path="/app" element={<p>Workspace opened</p>} /></Routes></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'SecurePassWord123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(screen.getByText('Workspace opened')).toBeInTheDocument());
    expect(login).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'SecurePassWord123' });
  });

  it('renders server errors accessibly', async () => {
    useAuthStore.setState({ user: null, status: 'anonymous', error: null, login: vi.fn().mockRejectedValue(new Error('Email or password is incorrect')) });
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Email or password is incorrect');
  });
});

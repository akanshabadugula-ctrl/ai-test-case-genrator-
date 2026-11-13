import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setBusy(true);
    try { await login({ email, password }); navigate((location.state as { from?: string } | null)?.from ?? '/app', { replace: true }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Sign in failed.'); }
    finally { setBusy(false); }
  }
  return <main className="auth-shell"><section className="auth-card" aria-labelledby="login-title">
    <Link className="brand" to="/">✦ TestPilot AI</Link><p className="eyebrow">YOUR TESTING WORKSPACE</p>
    <h1 id="login-title">Welcome back</h1><p className="muted">Sign in to continue to your workspace.</p>
    <form onSubmit={submit}>
      <label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      <label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
      {error && <p role="alert" className="form-error">{error}</p>}
      <button className="primary-button" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form><p className="auth-footer">New to TestPilot? <Link to="/signup">Create an account</Link></p>
  </section></main>;
}

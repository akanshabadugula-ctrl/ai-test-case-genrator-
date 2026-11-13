import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function SignupPage() {
  const signup = useAuthStore((state) => state.signup);
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const navigate = useNavigate();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setBusy(true);
    try { await signup({ name, email, password }); navigate('/app', { replace: true }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Account creation failed.'); }
    finally { setBusy(false); }
  }
  return <main className="auth-shell"><section className="auth-card" aria-labelledby="signup-title">
    <Link className="brand" to="/">✦ TestPilot AI</Link><p className="eyebrow">START TESTING SMARTER</p>
    <h1 id="signup-title">Create your account</h1><p className="muted">Your test engineering workspace starts here.</p>
    <form onSubmit={submit}>
      <label htmlFor="name">Name</label><input id="name" autoComplete="name" minLength={2} maxLength={80} required value={name} onChange={(event) => setName(event.target.value)} />
      <label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      <label htmlFor="password">Password</label><input id="password" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={(event) => setPassword(event.target.value)} /><small>Use at least 12 characters with uppercase, lowercase, and a number.</small>
      {error && <p role="alert" className="form-error">{error}</p>}
      <button className="primary-button" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
    </form><p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
  </section></main>;
}

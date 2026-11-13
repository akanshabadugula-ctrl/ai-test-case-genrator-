import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { AppShell } from './components/AppShell';
import { ProjectHeader } from './components/ProjectHeader';
import { ProjectsPage } from './pages/ProjectsPage';

const ProjectWorkspacePage = lazy(() => import('./pages/ProjectWorkspacePage').then((module) => ({ default: module.ProjectWorkspacePage })));
const AssistantWorkspacePage = lazy(() => import('./pages/AssistantWorkspacePage').then((module) => ({ default: module.AssistantWorkspacePage })));
import { ProtectedRoute } from './routes/ProtectedRoute';
import { useAuthStore } from './store/authStore';

function LandingPage() {
  return <main className="landing"><nav><Link className="brand" to="/">✦ TestPilot AI</Link><div><Link className="quiet-button" to="/login">Sign in</Link><Link className="primary-link" to="/signup">Get started</Link></div></nav>
    <section className="hero"><p className="eyebrow">AI-POWERED SOFTWARE TESTING</p><h1>Ship with confidence.<br /><span>Test with intelligence.</span></h1><p>Understand your codebase and build stronger tests with an AI testing workspace.</p><Link className="primary-link" to="/signup">Create your workspace <span aria-hidden="true">→</span></Link></section>
  </main>;
}

export default function App() {
  const restoreSession = useAuthStore((state) => state.restoreSession);
  useEffect(() => { void restoreSession(); }, [restoreSession]);
  return <BrowserRouter><Routes>
    <Route path="/" element={<LandingPage />} /><Route path="/login" element={<LoginPage />} /><Route path="/signup" element={<SignupPage />} />
    <Route element={<ProtectedRoute />}><Route path="/app" element={<AppShell />}>
      <Route index element={<WorkspacePage />} />
      <Route path="projects" element={<ProjectsPage />} />
      <Route path="projects/:projectId" element={<ProjectHeader />}>
        <Route index element={<Suspense fallback={<main className="page-state" aria-busy="true">Loading test studio…</main>}><ProjectWorkspacePage /></Suspense>} />
        <Route path="tutor" element={<Suspense fallback={<main className="page-state" aria-busy="true">Loading tutor…</main>}><AssistantWorkspacePage mode="tutor" /></Suspense>} />
        <Route path="voice" element={<Suspense fallback={<main className="page-state" aria-busy="true">Loading voice assistant…</main>}><AssistantWorkspacePage mode="voice" /></Suspense>} />
      </Route>
    </Route></Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter>;
}

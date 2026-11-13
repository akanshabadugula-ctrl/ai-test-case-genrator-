import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { Icon } from './Icons';
import { http } from '../api/http';

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const projects = useProjectStore((state) => state.projects);
  const refresh = useProjectStore((state) => state.refresh);
  const location = useLocation(); const navigate = useNavigate();
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    let alive = true;
    const check = async () => { try { await http.get('/health'); if (alive) setSystemStatus('online'); } catch { if (alive) setSystemStatus('offline'); } };
    void check(); const interval = window.setInterval(() => void check(), 30_000);
    return () => { alive = false; window.clearInterval(interval); };
  }, []);
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);
  const activeProjectId = location.pathname.match(/\/app\/projects\/([^/]+)/)?.[1];
  const sections = [
    { label: 'OVERVIEW', links: [{ to: '/app', label: 'Dashboard', icon: 'grid' as const }] },
    { label: 'WORKSPACE', links: [{ to: '/app/projects', label: 'Projects', icon: 'folder' as const }, ...(activeProjectId ? [{ to: `/app/projects/${activeProjectId}`, label: 'Test studio', icon: 'code' as const, end: true }, { to: `/app/projects/${activeProjectId}/tutor`, label: 'AI tutor', icon: 'sparkles' as const }, { to: `/app/projects/${activeProjectId}/voice`, label: 'Voice assistant', icon: 'mic' as const }] : [])] },
  ];
  return <div className={`app-frame ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'mobile-nav-open' : ''}`}>
    {mobileOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <aside className="sidebar" aria-label="Main navigation">
      <div className="side-brand-row"><NavLink to="/app" className="brand-mark"><span className="brand-glyph">✦</span><span className="brand-name">TestPilot<span>AI</span></span></NavLink><button className="icon-button desktop-collapse" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)}><Icon name="chevron" size={16} /></button><button className="icon-button mobile-close" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><Icon name="close" /></button></div>
      <div className="workspace-switcher" title="Current workspace"><span className="workspace-avatar">TP</span><span className="workspace-switcher-copy"><strong>Personal workspace</strong><small>Free plan</small></span><span className="switcher-dot" /></div>
      <div className="nav-scroll">{sections.map((section) => <section className="nav-section" key={section.label}><p className="nav-heading">{section.label}</p>{section.links.map((link) => <NavLink key={link.label} to={link.to} end={'end' in link ? link.end : link.label === 'Projects' || link.to === '/app'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon name={link.icon} /><span>{link.label}</span>{link.label === 'AI tutor' && <i className="nav-new">NEW</i>}</NavLink>)}</section>)}
        <section className="nav-section project-nav-section"><div className="nav-heading-row"><p className="nav-heading">YOUR PROJECTS</p><button className="mini-icon-button" aria-label="Create project" onClick={() => navigate('/app?new=1')}><Icon name="plus" size={14} /></button></div>{projects.slice(0, 5).map((project, index) => <NavLink key={project.id} to={`/app/projects/${project.id}`} className={({ isActive }) => `project-nav-item ${isActive ? 'active' : ''}`} title={project.projectName}><span className={`project-color color-${index % 4}`} /> <span>{project.projectName}</span></NavLink>)}{projects.length === 0 && <p className="sidebar-empty">Create a project to begin</p>}</section>
      </div>
      <div className="sidebar-bottom"><div className="profile-card"><span className="profile-avatar">{user?.name.slice(0, 1).toUpperCase() ?? 'T'}</span><span className="profile-copy"><strong>{user?.name ?? 'TestPilot user'}</strong><small>{user?.email}</small></span><button className="mini-icon-button profile-logout" aria-label="Sign out" onClick={() => void logout()}><Icon name="logout" size={16} /></button></div></div>
    </aside>
    <div className="main-area"><header className="topbar"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Icon name="menu" /></button><div className="breadcrumbs"><span>Workspace</span><Icon name="chevron" size={13} /><strong>{location.pathname.includes('/tutor') ? 'AI Tutor' : location.pathname.includes('/voice') ? 'Voice Assistant' : location.pathname.includes('/projects/') ? 'Test Studio' : location.pathname.includes('/projects') ? 'Projects' : 'Dashboard'}</strong></div><div className="topbar-right"><span className={`system-status system-${systemStatus}`}><i /> {systemStatus === 'checking' ? 'Checking API' : systemStatus === 'online' ? 'API connected' : 'API unavailable'}</span><span className="topbar-divider" /><span className="top-avatar" title={user?.name}>{user?.name.slice(0, 1).toUpperCase() ?? 'T'}</span></div></header><main className="content-area"><Outlet /></main></div>
  </div>;
}

import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, type FormEvent } from 'react';
import { projectApi, type Project } from '../api/projects';
import { Icon } from './Icons';

export function ProjectHeader() {
  const { projectId = '' } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const navigate = useNavigate();
  useEffect(() => { let active = true; projectApi.get(projectId).then((value) => { if (active) setProject(value); }).catch(() => { if (active) setError('This project could not be found or you do not have access.'); }); return () => { active = false; }; }, [projectId]);
  if (error) return <div className="project-loading-error"><span className="empty-illustration"><Icon name="folder" /></span><h1>Project unavailable</h1><p>{error}</p><a className="button-secondary" href="/app">Back to dashboard</a></div>;
  if (!project) return <div className="project-loading"><span className="skeleton" /><span className="skeleton" /><span className="skeleton" /></div>;
  const currentProject = project;
  async function saveProject(event: FormEvent) {
    event.preventDefault(); setSaving(true); setActionError('');
    try { const updated = await projectApi.update(currentProject.id, { projectName: nameDraft, description: descriptionDraft }); setProject(updated); setEditOpen(false); }
    catch { setActionError('Project details could not be saved. Please try again.'); }
    finally { setSaving(false); }
  }
  async function deleteProject() {
    if (!window.confirm(`Delete “${currentProject.projectName}” and its saved test suites? This cannot be undone.`)) return;
    try { await projectApi.remove(currentProject.id); navigate('/app'); }
    catch { setActionError('Project could not be deleted. Please try again.'); }
  }
  return <div className="project-page-stack"><div className="project-titlebar"><div className="project-title-icon"><Icon name="code" /></div><div className="project-title-copy"><div className="project-breadcrumb"><a href="/app">Projects</a><Icon name="chevron" size={13} /><span>{project.projectName}</span></div><h1>{project.projectName}</h1><p>{project.description || project.repositoryUrl || 'Add a description to give your workspace more context.'}</p></div><div className="project-title-actions"><span className="project-status"><i /> Active workspace</span><button className="button-secondary project-edit-button" onClick={() => { setNameDraft(project.projectName); setDescriptionDraft(project.description); setEditOpen(true); }}><Icon name="settings" size={15} /> Manage</button></div></div>
    {actionError && <div className="error-banner compact-error" role="alert"><span>{actionError}</span><button onClick={() => setActionError('')}>Dismiss</button></div>}
    <nav className="project-tabs" aria-label="Project workspace">{[{ to: `/app/projects/${projectId}`, label: 'Test studio', icon: 'code' as const, end: true }, { to: `/app/projects/${projectId}/tutor`, label: 'AI tutor', icon: 'sparkles' as const, end: false }, { to: `/app/projects/${projectId}/voice`, label: 'Voice assistant', icon: 'mic' as const, end: false }].map((tab) => <NavLink key={tab.label} to={tab.to} end={tab.end} className={({ isActive }) => `project-tab ${isActive ? 'active' : ''}`}><Icon name={tab.icon} size={16} />{tab.label}</NavLink>)}<span className="tab-spacer" /><div className="project-meta"><span><Icon name="shield" size={14} /> Private</span><span><Icon name="clock" size={14} /> Updated {new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(project.updatedAt))}</span></div></nav>
    <Outlet context={{ project, setProject }} />
    {editOpen && <div className="modal-backdrop" onKeyDown={(event) => { if (event.key === 'Escape') setEditOpen(false); }}><section className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="edit-project-title"><button className="dialog-close icon-button" aria-label="Close dialog" onClick={() => setEditOpen(false)}><Icon name="close" /></button><div className="dialog-icon"><Icon name="settings" /></div><p className="eyebrow">PROJECT SETTINGS</p><h2 id="edit-project-title">Manage project</h2><form onSubmit={saveProject}><label htmlFor="edit-project-name">Project name</label><input id="edit-project-name" autoFocus required minLength={2} maxLength={100} value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} /><label htmlFor="edit-project-description">Description</label><textarea id="edit-project-description" rows={3} maxLength={500} value={descriptionDraft} onChange={(event) => setDescriptionDraft(event.target.value)} />{actionError && <p role="alert" className="inline-error">{actionError}</p>}<div className="dialog-actions settings-dialog-actions"><button type="button" className="danger-button" onClick={() => void deleteProject()}><Icon name="trash" size={15} /> Delete project</button><span /><button type="button" className="button-secondary" onClick={() => setEditOpen(false)}>Cancel</button><button className="button-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button></div></form></section></div>}
  </div>;
}

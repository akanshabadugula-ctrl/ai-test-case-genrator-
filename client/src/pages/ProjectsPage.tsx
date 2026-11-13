import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Project } from '../api/projects';
import { Icon } from '../components/Icons';
import { useProjectStore } from '../store/projectStore';
import { CreateProjectDialog } from './WorkspacePage';

export function ProjectsPage() {
  const projects = useProjectStore((state) => state.projects); const loading = useProjectStore((state) => state.loading); const error = useProjectStore((state) => state.error); const refresh = useProjectStore((state) => state.refresh);
  const [dialogOpen, setDialogOpen] = useState(false); const navigate = useNavigate();
  const onCreated = (project: Project) => { setDialogOpen(false); navigate(`/app/projects/${project.id}`); };
  return <div className="page-stack projects-index-page"><section className="page-heading"><div><div className="eyebrow-row"><span className="live-dot" /> PROJECT LIBRARY</div><h1>Your projects</h1><p>Manage codebases and keep your test engineering work organized.</p></div><button className="button-primary" onClick={() => setDialogOpen(true)}><Icon name="plus" size={16} /> New project</button></section>
    {error && <div className="error-banner" role="alert"><span>{error}</span><button onClick={() => void refresh()}>Retry</button></div>}
    {loading && !projects.length ? <div className="projects-grid">{[0, 1, 2].map((item) => <div className="project-card-skeleton surface-card" key={item}><span className="skeleton" /><span className="skeleton" /><span className="skeleton" /></div>)}</div> : projects.length ? <div className="projects-grid">{projects.map((project, index) => <Link className="project-card surface-card" to={`/app/projects/${project.id}`} key={project.id}><div className="project-card-top"><span className={`project-tile color-${index % 4}`}><Icon name="code" /></span><span className="project-card-arrow"><Icon name="arrow" size={16} /></span></div><h2>{project.projectName}</h2><p>{project.description || 'No project description yet.'}</p><div className="project-card-bottom"><span><Icon name="check" size={14} /> {project.generationCount} test suites</span><span>{project.repositoryUrl ? 'Repository reference' : 'Code snippets'}</span></div></Link>)}</div> : <section className="surface-card projects-empty"><span className="empty-illustration"><Icon name="folder" size={25} /></span><h2>Your first project is one step away</h2><p>Create a workspace for your code, generated test suites, and learning conversations.</p><button className="button-primary" onClick={() => setDialogOpen(true)}><Icon name="plus" size={16} /> Create a project</button></section>}
    {dialogOpen && <CreateProjectDialog onClose={() => setDialogOpen(false)} onCreated={onCreated} />}
  </div>;
}

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { projectApi } from '../api/projects';
import { useProjectStore } from '../store/projectStore';
import { WorkspacePage } from './WorkspacePage';

vi.mock('../api/projects', () => ({
  projectApi: {
    list: vi.fn(), create: vi.fn(), dashboard: vi.fn(), get: vi.fn(), update: vi.fn(), remove: vi.fn(),
    generations: vi.fn(), generate: vi.fn(), saveGeneration: vi.fn(), tutorHistory: vi.fn(), tutorReply: vi.fn(),
  },
}));

const project = {
  id: 'project-1', projectName: 'Payments API', description: 'Checkout test workspace', repositoryUrl: '', repositorySummary: '',
  detectedTechnologies: [], generationCount: 0, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('workspace dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProjectStore.setState({ projects: [], loading: false, error: null });
    vi.mocked(projectApi.dashboard).mockResolvedValue({ projectCount: 0, generationCount: 0, dailyActivity: [], recentGenerations: [] });
    vi.mocked(projectApi.list).mockResolvedValue([]);
  });

  it('creates a project through the API and navigates to its workspace', async () => {
    const user = userEvent.setup();
    vi.mocked(projectApi.create).mockResolvedValue(project);
    render(<MemoryRouter initialEntries={['/app']}><Routes><Route path="/app" element={<WorkspacePage />} /><Route path="/app/projects/:projectId" element={<p>Project workspace opened</p>} /></Routes></MemoryRouter>);
    await screen.findByRole('heading', { level: 1 });
    await user.click(screen.getByRole('button', { name: 'New project' }));
    await user.type(screen.getByLabelText('Project name'), 'Payments API');
    await user.type(screen.getByLabelText(/Description/), 'Checkout test workspace');
    await user.click(screen.getByRole('button', { name: 'Create project' }));
    await waitFor(() => expect(projectApi.create).toHaveBeenCalledWith({ projectName: 'Payments API', description: 'Checkout test workspace', repositoryUrl: '' }));
    expect(await screen.findByText('Project workspace opened')).toBeInTheDocument();
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { projectApi } from '../api/projects';
import { useProjectStore } from './projectStore';

vi.mock('../api/projects', () => ({ projectApi: { list: vi.fn(), create: vi.fn(), remove: vi.fn() } }));
const project = { id: 'project-1', projectName: 'Billing API', description: '', repositoryUrl: '', repositorySummary: '', detectedTechnologies: [], generationCount: 0, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' };

describe('project state', () => {
  beforeEach(() => { useProjectStore.setState({ projects: [], loading: false, error: null }); vi.clearAllMocks(); });

  it('loads real project data from the API', async () => {
    vi.mocked(projectApi.list).mockResolvedValue([project]);
    await useProjectStore.getState().refresh();
    expect(useProjectStore.getState().projects).toEqual([project]);
    expect(useProjectStore.getState().error).toBeNull();
  });

  it('adds a project after the create API succeeds', async () => {
    vi.mocked(projectApi.create).mockResolvedValue(project);
    await useProjectStore.getState().create({ projectName: 'Billing API' });
    expect(useProjectStore.getState().projects).toEqual([project]);
  });

  it('keeps an actionable error when project loading fails', async () => {
    vi.mocked(projectApi.list).mockRejectedValue(new Error('offline'));
    await useProjectStore.getState().refresh();
    expect(useProjectStore.getState().projects).toEqual([]);
    expect(useProjectStore.getState().error).toContain('Could not complete');
  });
});

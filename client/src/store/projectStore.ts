import { create } from 'zustand';
import { projectApi, type Project } from '../api/projects';

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (input: { projectName: string; description?: string; repositoryUrl?: string }) => Promise<Project>;
  remove: (id: string) => Promise<void>;
}

function messageFrom(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { error?: { message?: string } } } }).response;
    if (response?.data?.error?.message) return response.data.error.message;
  }
  return 'Could not complete that request. Please try again.';
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [], loading: false, error: null,
  refresh: async () => {
    set({ loading: true, error: null });
    try { set({ projects: await projectApi.list(), loading: false }); }
    catch (error) { set({ loading: false, error: messageFrom(error) }); }
  },
  create: async (input) => {
    try { const project = await projectApi.create(input); set({ projects: [project, ...get().projects], error: null }); return project; }
    catch (error) { const message = messageFrom(error); set({ error: message }); throw new Error(message); }
  },
  remove: async (id) => {
    await projectApi.remove(id);
    set({ projects: get().projects.filter((project) => project.id !== id), error: null });
  },
}));

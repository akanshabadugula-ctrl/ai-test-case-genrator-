import { http } from './http';

export interface Project {
  id: string;
  projectName: string;
  description: string;
  repositoryUrl: string;
  repositorySummary: string;
  detectedTechnologies: string[];
  generationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Generation {
  id: string;
  generationType: 'unit' | 'integration' | 'api' | 'edge' | 'validation';
  goal: string;
  sourceCode: string;
  generatedContent: string;
  createdAt: string;
}

export interface DashboardSummary {
  projectCount: number;
  generationCount: number;
  dailyActivity: Array<{ date: string; count: number }>;
  recentGenerations: Array<{ id: string; projectId: string; projectName: string; generationType: string; goal: string; createdAt: string }>;
}

interface Data<T> { data: T }

export const projectApi = {
  async list(): Promise<Project[]> { return (await http.get<Data<{ projects: Project[] }>>('/projects')).data.data.projects; },
  async create(input: { projectName: string; description?: string; repositoryUrl?: string }): Promise<Project> { return (await http.post<Data<{ project: Project }>>('/projects', input)).data.data.project; },
  async get(projectId: string): Promise<Project> { return (await http.get<Data<{ project: Project }>>(`/projects/${projectId}`)).data.data.project; },
  async update(projectId: string, input: Partial<Pick<Project, 'projectName' | 'description' | 'repositoryUrl'>>): Promise<Project> { return (await http.patch<Data<{ project: Project }>>(`/projects/${projectId}`, input)).data.data.project; },
  async remove(projectId: string): Promise<void> { await http.delete(`/projects/${projectId}`); },
  async dashboard(): Promise<DashboardSummary> { return (await http.get<Data<DashboardSummary>>('/projects/dashboard')).data.data; },
  async generations(projectId: string): Promise<Generation[]> { return (await http.get<Data<{ generations: Generation[] }>>(`/projects/${projectId}/generations`)).data.data.generations; },
  async generate(projectId: string, input: { generationType: Generation['generationType']; goal: string; sourceCode: string }): Promise<Generation> { return (await http.post<Data<{ generation: Generation }>>(`/projects/${projectId}/generations`, input)).data.data.generation; },
  async saveGeneration(projectId: string, generationId: string, generatedContent: string): Promise<Generation> { return (await http.patch<Data<{ generation: Generation }>>(`/projects/${projectId}/generations/${generationId}`, { generatedContent })).data.data.generation; },
  async tutorHistory(projectId: string, threadId: string): Promise<ChatMessage[]> { return (await http.get<Data<{ messages: ChatMessage[] }>>(`/projects/${projectId}/tutor/messages`, { params: { threadId } })).data.data.messages; },
  async tutorReply(projectId: string, input: { threadId: string; mode: 'tutor' | 'voice'; message: string; sourceCode?: string }): Promise<string> { return (await http.post<Data<{ answer: string }>>(`/projects/${projectId}/tutor/messages`, input)).data.data.answer; },
};

export interface ChatMessage { role: 'user' | 'assistant'; content: string; mode: 'tutor' | 'voice'; createdAt: string }

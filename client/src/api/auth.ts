import { http } from './http';

export interface AuthUser { id: string; name: string; email: string }
interface UserResponse { data: { user: AuthUser } }

export const authApi = {
  async signup(input: { name: string; email: string; password: string }): Promise<AuthUser> {
    const { data } = await http.post<UserResponse>('/auth/signup', input);
    return data.data.user;
  },
  async login(input: { email: string; password: string }): Promise<AuthUser> {
    const { data } = await http.post<UserResponse>('/auth/login', input);
    return data.data.user;
  },
  async logout(): Promise<void> { await http.post('/auth/logout'); },
  async me(): Promise<AuthUser> {
    const { data } = await http.get<UserResponse>('/auth/me');
    return data.data.user;
  },
};

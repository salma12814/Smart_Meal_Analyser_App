import { api } from './axios'
import type { AuthResponse, LoginPayload, RegisterPayload } from '../types/auth'

export const authApi = {
  login: (payload: LoginPayload) => api.post<AuthResponse>('/v1/auth/login', payload).then((response) => response.data),
  register: (payload: RegisterPayload) => api.post<AuthResponse>('/v1/auth/register', payload).then((response) => response.data),
  logout: (refreshToken: string) => api.post<{ success: boolean; message: string }>('/v1/auth/logout', { refreshToken }),
}

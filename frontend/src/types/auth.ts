export interface AuthResponse {
  userId: string
  token: string
  refreshToken: string
  expiresIn: number
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role?: string
}

export interface StoredSession {
  token: string
  refreshToken: string
  user: AuthUser
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload extends LoginPayload {
  name: string
}

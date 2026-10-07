import { create } from 'zustand'
import { authApi } from '../api/authApi'
import { clearSession, readSession, userFromToken, writeSession } from '../lib/session'
import type { AuthUser, LoginPayload, RegisterPayload, StoredSession } from '../types/auth'

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  resetSession: () => void
}

const initialSession = readSession()

export const useAuthStore = create<AuthState>((set, get) => ({
  token: initialSession?.token ?? null,
  refreshToken: initialSession?.refreshToken ?? null,
  user: initialSession?.user ?? null,
  isAuthenticated: Boolean(initialSession?.token),
  login: async (payload) => {
    const response = await authApi.login(payload)
    const existing = get().user?.id === response.userId ? get().user : null
    const user = userFromToken(response.token, response.userId, payload.email, existing?.name ?? '')
    saveAuth(set, response.token, response.refreshToken, user)
  },
  register: async (payload) => {
    const response = await authApi.register(payload)
    const user = userFromToken(response.token, response.userId, payload.email, payload.name)
    saveAuth(set, response.token, response.refreshToken, user)
  },
  logout: async () => {
    const refresh = get().refreshToken
    try {
      if (refresh) await authApi.logout(refresh)
    } finally {
      get().resetSession()
    }
  },
  resetSession: () => {
    clearSession()
    set({ token: null, refreshToken: null, user: null, isAuthenticated: false })
  },
}))

function saveAuth(set: (partial: Partial<AuthState>) => void, token: string, refreshToken: string, user: AuthUser) {
  const session: StoredSession = { token, refreshToken, user }
  writeSession(session)
  set({ token, refreshToken, user, isAuthenticated: true })
}

import type { AuthUser, StoredSession } from '../types/auth'

const SESSION_KEY = 'smeal.session.v1'

export function readSession(): StoredSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const value: unknown = JSON.parse(raw)
    if (
      typeof value === 'object' && value !== null &&
      'token' in value && typeof value.token === 'string' &&
      'refreshToken' in value && typeof value.refreshToken === 'string' &&
      'user' in value && typeof value.user === 'object' && value.user !== null
    ) return value as StoredSession
  } catch {
    window.localStorage.removeItem(SESSION_KEY)
  }
  return null
}

export function writeSession(session: StoredSession): void {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  window.localStorage.removeItem(SESSION_KEY)
}

export function updateSessionTokens(token: string, refreshToken: string): void {
  const current = readSession()
  if (current) writeSession({ ...current, token, refreshToken })
}

export function userFromToken(token: string, id: string, fallbackEmail: string, name = ''): AuthUser {
  try {
    const payload = token.split('.')[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const claims = JSON.parse(window.atob(normalized)) as { email?: string; role?: string }
    return { id, email: claims.email || fallbackEmail, name, role: claims.role }
  } catch {
    return { id, email: fallbackEmail, name }
  }
}

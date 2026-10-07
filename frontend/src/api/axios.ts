import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import type { AuthResponse } from '../types/auth'
import { clearSession, readSession, updateSessionTokens } from '../lib/session'

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()

const baseURL = (
  configuredApiUrl || 'http://localhost:8082/api'
).replace(/\/+$/, '')

export const api = axios.create({
  baseURL,
  timeout: 45_000,
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = readSession()?.token

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }

  return config
})

type RetriableRequest = InternalAxiosRequestConfig & {
  _smealRetried?: boolean
}

let refreshRequest: Promise<string | null> | null = null

api.interceptors.response.use(
  (response) => response,
  async (cause: unknown) => {
    if (!axios.isAxiosError(cause)) {
      throw cause
    }

    const error = cause as AxiosError
    const config = error.config as RetriableRequest | undefined

    if (error.response?.status !== 401 || !config) {
      throw error
    }

    if (
      config._smealRetried ||
      config.url?.includes('/v1/auth/')
    ) {
      throw error
    }

    config._smealRetried = true

    const session = readSession()

    if (!session?.refreshToken) {
      expireSession()
      throw error
    }

    if (!refreshRequest) {
      refreshRequest = axios
        .post<AuthResponse>(
          `${baseURL}/v1/auth/refresh`,
          {
            refreshToken: session.refreshToken,
          },
          {
            timeout: 15_000,
          }
        )
        .then(({ data }) => {
          updateSessionTokens(data.token, data.refreshToken)
          return data.token
        })
        .catch(() => {
          expireSession()
          return null
        })
        .finally(() => {
          refreshRequest = null
        })
    }

    const token = await refreshRequest

    if (!token) {
      throw error
    }

    config.headers.set('Authorization', `Bearer ${token}`)

    return api(config)
  }
)

function expireSession() {
  clearSession()

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new Event('smeal:session-expired')
    )
  }
}
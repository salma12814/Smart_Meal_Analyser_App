import { useEffect } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { useAuthStore } from './store/authStore'
import { AnalyzeMeal } from './pages/AnalyzeMeal'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { MealDetails } from './pages/MealDetails'
import { MealHistory } from './pages/MealHistory'
import { NotFound } from './pages/NotFound'
import { Profile } from './pages/Profile'
import { Register } from './pages/Register'

function ProtectedRoutes() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />
}

function PublicRoutes() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}

function SessionEventBridge() {
  const resetSession = useAuthStore((state) => state.resetSession)
  useEffect(() => {
    const handleExpired = () => resetSession()
    window.addEventListener('smeal:session-expired', handleExpired)
    return () => window.removeEventListener('smeal:session-expired', handleExpired)
  }, [resetSession])
  return null
}

export function App() {
  return (
    <BrowserRouter>
      <SessionEventBridge />
      <Routes>
        <Route element={<PublicRoutes />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<ProtectedRoutes />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analyze" element={<AnalyzeMeal />} />
            <Route path="/meals" element={<MealHistory />} />
            <Route path="/meals/:id" element={<MealDetails />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

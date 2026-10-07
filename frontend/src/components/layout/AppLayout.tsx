import { useState } from 'react'
import { Activity, Camera, LayoutDashboard, Leaf, LogOut, Menu, UserRound, Utensils, X } from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const navigation = [
  { to: '/dashboard', label: 'Vue d’ensemble', icon: LayoutDashboard },
  { to: '/analyze', label: 'Analyser un repas', icon: Camera },
  { to: '/meals', label: 'Historique', icon: Utensils },
  { to: '/profile', label: 'Mon profil', icon: UserRound },
]

const titles: Record<string, string> = {
  '/dashboard': 'Vue d’ensemble', '/analyze': 'Nouvelle analyse', '/meals': 'Historique des repas', '/profile': 'Mon profil',
}

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const title = location.pathname.startsWith('/meals/') ? 'Détail du repas' : titles[location.pathname] ?? 'SmartMeal'
  const displayName = user?.name || user?.email || 'Mon compte'
  const initials = user?.name ? user.name.slice(0, 1).toUpperCase() : user?.email?.slice(0, 1).toUpperCase() || 'S'

  const signOut = async () => {
    setMenuOpen(false)
    try { await logout() } catch { /* La session locale est supprimée même si le serveur ne répond pas. */ }
    navigate('/login', { replace: true })
  }

  const navContent = (includeBrand = true) => (
    <>
      {includeBrand && <div className="brand-lockup"><span className="brand-mark"><Leaf size={19} fill="currentColor" /></span><span>smartmeal<span className="brand-period">.</span></span></div>}
      <div className="nav-label">ESPACE PERSONNEL</div>
      <nav className="side-nav" aria-label="Navigation principale">
        {navigation.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `side-nav-link ${isActive ? 'active' : ''}`}><Icon size={18} strokeWidth={1.8} /><span>{label}</span></NavLink>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-note"><span className="sidebar-note-icon"><Activity size={17} /></span><div><strong>Vos repas, en clair</strong><span>Des repères qui vous ressemblent.</span></div></div>
        <button className="account-row" type="button" onClick={() => navigate('/profile')}><span className="avatar avatar-small">{initials}</span><span className="account-copy"><strong>{displayName}</strong><small>{user?.role || 'Membre'}</small></span><UserRound size={16} className="account-chevron" /></button>
        <button className="logout-link" type="button" onClick={() => void signOut()}><LogOut size={16} />Se déconnecter</button>
      </div>
    </>
  )

  return (
    <div className="app-shell">
      <aside className="desktop-sidebar">{navContent()}</aside>
      {menuOpen && <div className="mobile-menu-backdrop" onClick={() => setMenuOpen(false)} />}
      <aside className={`mobile-sidebar ${menuOpen ? 'mobile-sidebar-open' : ''}`} aria-label="Menu mobile">
        <div className="mobile-sidebar-head"><div className="brand-lockup"><span className="brand-mark"><Leaf size={19} fill="currentColor" /></span><span>smartmeal<span className="brand-period">.</span></span></div><button className="icon-button" aria-label="Fermer le menu" onClick={() => setMenuOpen(false)}><X size={20} /></button></div>
        {navContent(false)}
      </aside>
      <div className="app-main-column">
        <header className="topbar">
          <button className="icon-button mobile-menu-trigger" aria-label="Ouvrir le menu" onClick={() => setMenuOpen(true)}><Menu size={21} /></button>
          <div className="topbar-crumb"><span>SmartMeal</span><span className="crumb-separator">/</span><strong>{title}</strong></div>
          <button className="topbar-user" type="button" onClick={() => navigate('/profile')} aria-label="Ouvrir mon profil"><span className="avatar">{initials}</span><span className="topbar-user-name">{displayName}</span></button>
        </header>
        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  )
}

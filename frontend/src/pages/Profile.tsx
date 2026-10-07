import { BadgeCheck, CalendarDays, Fingerprint, LogOut, Mail, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAuthStore } from '../store/authStore'

export function Profile() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const signOut = async () => {
    try { await logout() } catch { /* La session locale est supprimée même si le serveur ne répond pas. */ }
    navigate('/login', { replace: true })
  }

  return (
    <div className="page-stack profile-page">
      <div className="page-heading"><div><span className="page-eyebrow"><span className="eyebrow-dot" /> VOTRE COMPTE</span><h1>Mon profil</h1><p>Les informations associées à votre session SmartMeal.</p></div></div>
      <Card className="profile-identity"><span className="profile-avatar"><UserRound size={25} /></span><div><span className="page-eyebrow">COMPTE PERSONNEL</span><h2>{user?.name || user?.email || 'Compte SmartMeal'}</h2><p>Connecté à SmartMeal</p></div><span className="profile-secure"><BadgeCheck size={15} /> Session active</span></Card>
      <Card className="profile-details-card"><div className="profile-card-heading"><div><span className="page-eyebrow">INFORMATIONS DISPONIBLES</span><h2>Votre compte</h2></div></div>
        <dl className="profile-fields">
          <div className="profile-field"><span className="profile-field-icon"><UserRound size={17} /></span><dt>Nom</dt><dd>{user?.name || 'Non fourni par l’API de profil'}</dd></div>
          <div className="profile-field"><span className="profile-field-icon"><Mail size={17} /></span><dt>Adresse e-mail</dt><dd>{user?.email || 'Indisponible'}</dd></div>
          <div className="profile-field"><span className="profile-field-icon"><Fingerprint size={17} /></span><dt>Rôle</dt><dd>{user?.role || 'Indisponible'}</dd></div>
          <div className="profile-field"><span className="profile-field-icon"><CalendarDays size={17} /></span><dt>Création du compte</dt><dd>Non fourni par l’API de profil</dd></div>
        </dl>
        <p className="profile-api-note">Le backend actuel ne propose pas encore de route de consultation ou de modification du profil.</p>
      </Card>
      <Card className="profile-signout"><div><h3>Terminer cette session</h3><p>Vous pourrez vous reconnecter à tout moment.</p></div><Button variant="secondary" icon={<LogOut size={15} />} onClick={() => void signOut()}>Se déconnecter</Button></Card>
    </div>
  )
}

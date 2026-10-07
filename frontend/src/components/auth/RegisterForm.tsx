import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { getErrorMessage } from '../../lib/errors'
import { Button } from '../ui/Button'
import { InlineAlert } from '../ui/PageStates'

export function RegisterForm() {
  const register = useAuthStore((state) => state.register)
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (password.length < 8) { setError('Choisissez un mot de passe de 8 caractères minimum.'); return }
    if (password !== confirmation) { setError('Les deux mots de passe ne correspondent pas.'); return }
    setLoading(true)
    try {
      await register({ name: name.trim(), email: email.trim(), password })
      navigate('/dashboard', { replace: true })
    } catch (cause) { setError(getErrorMessage(cause, 'Création du compte impossible.')) }
    finally { setLoading(false) }
  }

  return (
    <>
      <div className="auth-heading"><span className="auth-kicker">VOTRE ESPACE, À VOUS</span><h1>Faisons connaissance.</h1><p>Quelques informations pour commencer à explorer vos repas.</p></div>
      {error && <InlineAlert>{error}</InlineAlert>}
      <form className="auth-form auth-form-register" onSubmit={(event) => void submit(event)}>
        <label className="field-label" htmlFor="register-name">Nom</label><div className="input-wrap"><UserRound size={17} /><input id="register-name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Votre nom" maxLength={120} required /></div>
        <label className="field-label" htmlFor="register-email">Adresse e-mail</label><div className="input-wrap"><Mail size={17} /><input id="register-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@exemple.com" maxLength={320} required /></div>
        <label className="field-label" htmlFor="register-password">Mot de passe</label><div className="input-wrap"><LockKeyhole size={17} /><input id="register-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8 caractères minimum" minLength={8} maxLength={100} required /><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
        <label className="field-label" htmlFor="register-confirm">Confirmer le mot de passe</label><div className="input-wrap"><LockKeyhole size={17} /><input id="register-confirm" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Saisissez-le à nouveau" minLength={8} required /></div>
        <Button className="auth-submit" size="lg" type="submit" loading={loading}>Créer mon compte <ArrowRight size={17} /></Button>
      </form>
      <p className="auth-switch">Déjà membre ? <Link to="/login">Se connecter</Link></p>
    </>
  )
}

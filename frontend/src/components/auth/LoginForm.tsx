import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { getErrorMessage } from '../../lib/errors'
import { Button } from '../ui/Button'
import { InlineAlert } from '../ui/PageStates'

export function LoginForm() {
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true); setError('')
    try {
      await login({ email: email.trim(), password })
      navigate('/dashboard', { replace: true })
    } catch (cause) { setError(getErrorMessage(cause, 'Connexion impossible.')) }
    finally { setLoading(false) }
  }

  return (
    <>
      <div className="auth-heading"><span className="auth-kicker">HEUREUX DE VOUS REVOIR</span><h1>Reprenons le fil.</h1><p>Connectez-vous pour retrouver vos repères et vos analyses.</p></div>
      {error && <InlineAlert>{error}</InlineAlert>}
      <form className="auth-form" onSubmit={(event) => void submit(event)}>
        <label className="field-label" htmlFor="login-email">Adresse e-mail</label>
        <div className="input-wrap"><Mail size={17} /><input id="login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@exemple.com" required /></div>
        <div className="field-label-row"><label className="field-label" htmlFor="login-password">Mot de passe</label></div>
        <div className="input-wrap"><LockKeyhole size={17} /><input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Votre mot de passe" required /><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
        <Button className="auth-submit" size="lg" type="submit" loading={loading}>Se connecter <ArrowRight size={17} /></Button>
      </form>
      <p className="auth-switch">Vous découvrez SmartMeal ? <Link to="/register">Créer un compte</Link></p>
    </>
  )
}

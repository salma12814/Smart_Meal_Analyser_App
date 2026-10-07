import { ArrowLeft, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFound() {
  return <main className="not-found"><span className="not-found-icon"><SearchX size={25} /></span><span className="page-eyebrow">PAGE INTROUVABLE</span><h1>Ce chemin ne mène nulle part.</h1><p>La page demandée n’existe pas ou a été déplacée.</p><Link to="/dashboard" className="button button-primary button-md"><ArrowLeft size={16} />Revenir à l’accueil</Link></main>
}

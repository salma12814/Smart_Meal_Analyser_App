import { ArrowRight, ArrowUpRight, Camera, ChartNoAxesCombined, Clock3, Utensils } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { mealApi } from '../api/mealApi'
import { MealCard } from '../components/meals/MealCard'
import { Card } from '../components/ui/Card'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/PageStates'
import { useAuthStore } from '../store/authStore'
import type { MealHistoryResponse } from '../types/meal'
import { getErrorMessage } from '../lib/errors'

export function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const [history, setHistory] = useState<MealHistoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setHistory(await mealApi.history(0, 6)) }
    catch (cause) { setError(getErrorMessage(cause, 'Impossible de charger vos analyses.')) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])

  const average = history?.meals.length ? Math.round(history.meals.reduce((sum, meal) => sum + meal.score, 0) / history.meals.length) : null
  const firstName = user?.name?.trim().split(/\s+/)[0] || user?.email?.split('@')[0] || 'vous'
  const today = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

  return (
    <div className="page-stack">
      <section className="dashboard-hero">
        <div className="hero-copy"><span className="page-eyebrow"><span className="eyebrow-dot" /> VOTRE ESPACE NUTRITION</span><h1>Bonjour, {firstName}<span className="hero-period">.</span></h1><p>Un peu de clarté dans votre assiette, un repas à la fois.</p><div className="hero-date"><Clock3 size={15} />{today}</div></div>
        <div className="hero-art" aria-hidden="true"><div className="hero-art-orbit orbit-one" /><div className="hero-art-orbit orbit-two" /><div className="hero-art-center"><Utensils size={31} strokeWidth={1.35} /></div><span className="hero-art-leaf leaf-one" /><span className="hero-art-leaf leaf-two" /></div>
        <Link to="/analyze" className="hero-cta"><Camera size={16} /> Analyser un repas <ArrowRight size={16} /></Link>
      </section>

      {error && <ErrorState message={error} onRetry={() => void load()} />}
      {!error && loading && <div className="dashboard-loading"><LoadingState label="Chargement de vos analyses…" /></div>}
      {!error && !loading && history && <>
        <section className="stat-grid" aria-label="Statistiques des repas">
          <Card className="stat-card"><div className="stat-card-icon stat-icon-green"><Utensils size={18} /></div><span className="stat-label">Repas analysés</span><div className="stat-number-row"><strong>{history.total}</strong><span className="stat-symbol">repas</span></div><p className="stat-footnote">Depuis la création de votre compte</p></Card>
          <Card className="stat-card"><div className="stat-card-icon stat-icon-sand"><ChartNoAxesCombined size={18} /></div><span className="stat-label">Score moyen récent</span><div className="stat-number-row"><strong>{average ?? '—'}</strong>{average !== null && <span className="stat-symbol">/ 100</span>}</div><p className="stat-footnote">{history.meals.length ? `Sur ${history.meals.length} analyse${history.meals.length > 1 ? 's' : ''} récente${history.meals.length > 1 ? 's' : ''}` : 'Vos premières analyses apparaîtront ici'}</p></Card>
          <Card className="stat-callout"><span className="callout-orb"><ChartNoAxesCombined size={20} /></span><div><strong>À votre rythme.</strong><p>Chaque analyse ajoute un repère à votre parcours.</p><Link to="/analyze">Faire une analyse <ArrowUpRight size={14} /></Link></div></Card>
        </section>

        <section className="recent-section">
          <div className="section-heading"><div><span className="page-eyebrow">VOTRE PARCOURS</span><h2>Repas récents</h2></div><Link to="/meals" className="text-link">Tout l’historique <ArrowRight size={15} /></Link></div>
          {history.meals.length ? <div className="meal-grid">{history.meals.slice(0, 3).map((meal) => <MealCard key={meal.mealId} meal={meal} />)}</div> : <Card className="recent-empty"><EmptyState title="Votre première analyse vous attend" description="Ajoutez une photo de votre assiette pour découvrir les aliments et leurs repères nutritionnels." action={<Link to="/analyze" className="button button-primary button-md"><Camera size={16} />Analyser un repas</Link>} /></Card>}
        </section>
      </>}
    </div>
  )
}

import { ArrowRight, Camera } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { mealApi } from '../api/mealApi'
import { MealCard } from '../components/meals/MealCard'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/PageStates'
import { getErrorMessage } from '../lib/errors'
import type { MealHistoryItem } from '../types/meal'

const PAGE_SIZE = 20

export function MealHistory() {
  const [meals, setMeals] = useState<MealHistoryItem[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  const loadPage = useCallback(async (append = false, offset = 0) => {
    append ? setLoadingMore(true) : setLoading(true)
    setError('')
    try {
      const response = await mealApi.history(offset, PAGE_SIZE)
      const detailed = await Promise.all(response.meals.map(async (meal) => {
        try { return { ...meal, detectedFoods: (await mealApi.details(meal.mealId)).detectedFoods } }
        catch { return meal }
      }))
      setMeals((current) => append ? [...current, ...detailed] : detailed)
      setTotal(response.total); setHasMore(response.hasMore)
    } catch (cause) { setError(getErrorMessage(cause, 'Impossible de charger votre historique.')) }
    finally { setLoading(false); setLoadingMore(false) }
  }, [])

  useEffect(() => { void loadPage() }, [loadPage])

  return (
    <div className="page-stack">
      <div className="page-heading history-heading"><div><span className="page-eyebrow"><span className="eyebrow-dot" /> VOTRE JOURNAL</span><h1>Historique des repas</h1><p>Retrouvez vos analyses, vos aliments détectés et vos scores santé.</p></div>{!loading && !error && total > 0 && <span className="history-count">{total} analyse{total > 1 ? 's' : ''}</span>}</div>
      {error && <ErrorState message={error} onRetry={() => void loadPage()} />}
      {!error && loading && <LoadingState label="Récupération de votre historique…" />}
      {!error && !loading && meals.length === 0 && <Card><EmptyState title="Pas encore de repas" description="Analysez votre premier repas pour commencer à voir vos repères nutritionnels ici." action={<Link to="/analyze" className="button button-primary button-md"><Camera size={16} />Analyser un repas</Link>} /></Card>}
      {!error && meals.length > 0 && <>
        <div className="history-summary"><span>VOS ANALYSES</span><strong>{meals.length}<small> / {total}</small></strong><div className="summary-rule"><span style={{ width: total ? `${Math.min(100, meals.length / total * 100)}%` : '0%' }} /></div></div>
        <div className="meal-grid history-grid">{meals.map((meal) => <MealCard key={meal.mealId} meal={meal} />)}</div>
        {hasMore && <div className="load-more-row"><Button variant="secondary" loading={loadingMore} onClick={() => void loadPage(true, meals.length)}>Charger la suite <ArrowRight size={15} /></Button></div>}
      </>}
    </div>
  )
}

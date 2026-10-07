import { ArrowLeft, ImageOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { mealApi } from '../api/mealApi'
import { DetectedFoods } from '../components/meals/DetectedFoods'
import { HealthScore } from '../components/meals/HealthScore'
import { NutritionPanel } from '../components/meals/NutritionPanel'
import { Recommendations } from '../components/meals/Recommendations'
import { Card } from '../components/ui/Card'
import { ErrorState, LoadingState } from '../components/ui/PageStates'
import { useMealImage } from '../hooks/useMealImage'
import { formatDate } from '../lib/format'
import { getErrorMessage } from '../lib/errors'
import type { MealAnalysis, MealDetails as MealDetailsType } from '../types/meal'

interface DetailNavigationState { meal?: MealAnalysis; imageFile?: File }

export function MealDetails() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigationState = location.state as DetailNavigationState | null
  const [meal, setMeal] = useState<MealDetailsType | null>(navigationState?.meal ?? null)
  const [loading, setLoading] = useState(!navigationState?.meal)
  const [error, setError] = useState('')
  const image = useMealImage(id, navigationState?.imageFile)

  useEffect(() => {
    if (!id) return
    let active = true
    setLoading(true); setError('')
    void mealApi.details(id).then((result) => { if (active) setMeal(result) })
      .catch((cause: unknown) => { if (active) setError(getErrorMessage(cause, 'Impossible de charger le détail de ce repas.')) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  return (
    <div className="page-stack detail-page">
      <Link className="back-link" to="/meals"><ArrowLeft size={16} /> Retour à l’historique</Link>
      {loading && <LoadingState label="Chargement de votre analyse…" />}
      {error && <ErrorState message={error} onRetry={() => { if (id) { setLoading(true); setError(''); void mealApi.details(id).then(setMeal).catch((cause: unknown) => setError(getErrorMessage(cause))).finally(() => setLoading(false)) } }} />}
      {!loading && !error && meal && <>
        <div className="page-heading detail-heading"><div><span className="page-eyebrow"><span className="eyebrow-dot" /> RAPPORT DE REPAS</span><h1>Votre analyse</h1><p>{formatDate(meal.timestamp)}</p></div><span className={`grade-pill grade-${meal.healthScore.grade.toLowerCase()}`}>Grade {meal.healthScore.grade}</span></div>
        <section className="detail-top-grid">
          <Card className="detail-image-card">{image ? <img src={image} alt="Repas analysé" /> : <div className="detail-image-empty"><span><ImageOff size={23} /></span><strong>Image non disponible</strong><p>L’API ne fournit pas l’image dans son historique. Les nouvelles analyses restent visibles sur cet appareil.</p></div>}</Card>
          <HealthScore score={meal.healthScore.score} grade={meal.healthScore.grade} />
        </section>
        <section className="detail-section"><div className="section-heading"><div><span className="page-eyebrow">RECONNAISSANCE IA</span><h2>Aliments détectés</h2></div><span className="section-count">{meal.detectedFoods.length} identifié{meal.detectedFoods.length > 1 ? 's' : ''}</span></div><DetectedFoods foods={meal.detectedFoods} /></section>
        <section className="detail-section"><div className="section-heading"><div><span className="page-eyebrow">APERÇU NUTRITIONNEL</span><h2>Repères du repas</h2></div></div><NutritionPanel nutrition={meal.nutritionData} /><p className="nutrition-footnote">Estimations calculées à partir des valeurs par 100 g des aliments détectés, sans estimation du poids des portions.</p></section>
        <section className="detail-section"><Recommendations recommendations={meal.recommendations} /></section>
      </>}
    </div>
  )
}

import { ArrowUpRight, ImageOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMealImage } from '../../hooks/useMealImage'
import { formatDate, formatFoodName } from '../../lib/format'
import type { MealHistoryItem } from '../../types/meal'

export function MealCard({ meal }: { meal: MealHistoryItem }) {
  const image = useMealImage(meal.mealId)
  const foods = meal.detectedFoods?.slice(0, 2).map((food) => formatFoodName(food.food))
  return (
    <Link className="meal-card" to={`/meals/${meal.mealId}`} aria-label={`Ouvrir le repas du ${formatDate(meal.timestamp)}`}>
      <div className="meal-card-image">{image ? <img src={image} alt="Repas analysé" /> : <div className="image-placeholder"><ImageOff size={20} /><span>Aperçu indisponible</span></div>}<span className={`grade-pill grade-${meal.grade.toLowerCase()}`}>Grade {meal.grade}</span></div>
      <div className="meal-card-body"><div className="meal-card-line"><span>{formatDate(meal.timestamp)}</span><ArrowUpRight size={15} /></div><h3>{foods?.length ? foods.join(' · ') : 'Analyse de repas'}</h3><div className="meal-card-score"><span>Score santé</span><strong>{meal.score}<small> / 100</small></strong></div></div>
    </Link>
  )
}

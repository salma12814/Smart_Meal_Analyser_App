import { Check, CircleHelp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { nutritionApi } from '../../api/nutritionApi'
import { formatFoodName, formatNumber } from '../../lib/format'
import type { FoodPrediction, NutritionFood } from '../../types/meal'
import { Card } from '../ui/Card'

export function DetectedFoods({ foods }: { foods: FoodPrediction[] }) {
  const [nutrition, setNutrition] = useState<Record<string, NutritionFood>>({})
  useEffect(() => {
    let active = true
    void Promise.allSettled(foods.map((food) => nutritionApi.food(food.food))).then((results) => {
      if (!active) return
      const next: Record<string, NutritionFood> = {}
      results.forEach((result, index) => { if (result.status === 'fulfilled') next[foods[index].food] = result.value })
      setNutrition(next)
    })
    return () => { active = false }
  }, [foods])

  if (!foods.length) return <Card className="empty-foods"><CircleHelp size={19} /><span>Aucun aliment n’a été identifié.</span></Card>
  return (
    <div className="food-grid">
      {foods.map((food, index) => {
        const detail = nutrition[food.food]
        return (
          <Card className="food-card" key={`${food.food}-${index}`}>
            <div className="food-card-top"><span className="food-number">{String(index + 1).padStart(2, '0')}</span><span className="confidence"><Check size={13} />{Math.round(food.confidence * 100)} %</span></div>
            <h3>{formatFoodName(food.food)}</h3>
            <p className="food-card-meta">Confiance de détection</p>
            <div className="food-calories">{detail ? <><strong>{formatNumber(detail.caloriesPer100g)} <small>kcal</small></strong><span>pour 100 g</span></> : <span className="food-lookup-pending">Valeurs détaillées indisponibles</span>}</div>
          </Card>
        )
      })}
    </div>
  )
}

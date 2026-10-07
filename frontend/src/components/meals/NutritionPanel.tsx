import { Card } from '../ui/Card'
import { formatNumber } from '../../lib/format'
import type { NutritionTotals } from '../../types/meal'

const items: { label: string; key: keyof NutritionTotals; unit: string; primary?: boolean }[] = [
  { label: 'Énergie', key: 'calories', unit: 'kcal', primary: true },
  { label: 'Protéines', key: 'proteins', unit: 'g', primary: true },
  { label: 'Glucides', key: 'carbs', unit: 'g', primary: true },
  { label: 'Lipides', key: 'fats', unit: 'g', primary: true },
  { label: 'Fibres', key: 'fiber', unit: 'g' },
  { label: 'Sodium', key: 'sodium', unit: 'mg' },
  { label: 'Sucres', key: 'sugarTotal', unit: 'g' },
]

export function NutritionPanel({ nutrition }: { nutrition: NutritionTotals }) {
  const available = items.filter((item) => typeof nutrition[item.key] === 'number')
  if (!available.length) return <Card className="empty-foods">Les informations nutritionnelles ne sont pas disponibles.</Card>
  return <div className="nutrition-grid">{available.map((item) => (
    <Card className={`nutrition-card ${item.primary ? 'nutrition-card-primary' : ''}`} key={item.key}>
      <span>{item.label}</span><strong>{formatNumber(nutrition[item.key], item.key === 'calories' ? 0 : 1)} <small>{item.unit}</small></strong>
    </Card>
  ))}</div>
}

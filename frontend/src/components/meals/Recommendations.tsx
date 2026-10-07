import { ArrowUpRight, Sparkles } from 'lucide-react'
import type { Recommendation } from '../../types/meal'
import { Card } from '../ui/Card'
import { formatFoodName, formatNumber } from '../../lib/format'

export function Recommendations({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <Card className="recommendations-card">
      <div className="recommendation-heading"><span className="recommendation-icon"><Sparkles size={17} /></span><div><p className="eyebrow">POUR LA SUITE</p><h2>Suggestions intelligentes</h2></div></div>
      {recommendations.length ? <div className="recommendation-list">{recommendations.map((item, index) => (
        <div className="recommendation-row" key={`${item.food}-${index}`}><span className="recommendation-index">{String(index + 1).padStart(2, '0')}</span><div className="recommendation-copy"><strong>{formatFoodName(item.food)}</strong><p>{item.reason}</p></div><span className="recommendation-boost"><ArrowUpRight size={13} /> +{formatNumber(item.score, 1)}</span></div>
      ))}</div> : <div className="recommendation-empty">Aucune suggestion n’a été retournée pour ce repas.</div>}
    </Card>
  )
}

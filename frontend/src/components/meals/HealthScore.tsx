import { Card } from '../ui/Card'

const gradeColors: Record<string, string> = {
  A: '#16895b', B: '#64a943', C: '#c58a22', D: '#d77939', E: '#c9534c', F: '#c9534c',
}

export function HealthScore({ score, grade, compact = false }: { score: number; grade: string; compact?: boolean }) {
  const color = gradeColors[grade.toUpperCase()] ?? '#16895b'
  const progress = Math.min(100, Math.max(0, score))
  const radius = compact ? 29 : 47
  const circumference = 2 * Math.PI * radius
  return (
    <Card className={`health-score-card ${compact ? 'health-score-compact' : ''}`}>
      <div className="health-score-heading"><div><p className="eyebrow">ÉQUILIBRE DU REPAS</p><h2>Score santé</h2></div><span className="score-grade" style={{ color }}>{grade}</span></div>
      <div className="score-ring-wrap" aria-label={`Score ${score} sur 100, grade ${grade}`}>
        <svg className="score-ring" viewBox="0 0 120 120" role="img" aria-hidden="true">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#edf1ed" strokeWidth={compact ? 7 : 8} />
          <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth={compact ? 7 : 8} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress / 100)} transform="rotate(-90 60 60)" className="score-ring-progress" />
        </svg>
        <div className="score-ring-label"><strong>{score}</strong><span>/ 100</span></div>
      </div>
      {!compact && <p className="score-caption">Calculé à partir des données nutritionnelles du repas.</p>}
    </Card>
  )
}

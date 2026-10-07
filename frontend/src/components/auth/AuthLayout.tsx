import { Activity, ArrowUpRight, Leaf, ShieldCheck, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function AuthLayout({ children, mode }: { children: ReactNode; mode: 'login' | 'register' }) {
  return (
    <main className={`auth-page auth-page-${mode}`}>
      <section className="auth-form-panel">
        <Link to="/login" className="brand-lockup auth-brand"><span className="brand-mark"><Leaf size={19} fill="currentColor" /></span><span>smartmeal<span className="brand-period">.</span></span></Link>
        <div className="auth-form-wrap">{children}</div>
        <p className="auth-legal"><ShieldCheck size={14} /> Vos données restent privées et sécurisées.</p>
      </section>
      <aside className="auth-story-panel">
        <div className="auth-story-glow auth-glow-one" /><div className="auth-story-glow auth-glow-two" />
        <div className="story-topline"><span className="story-live-dot" /> VOTRE ASSISTANT NUTRITIONNEL</div>
        <div className="story-copy"><div className="story-icon"><Sparkles size={18} /></div><p className="eyebrow">MANGEZ EN TOUTE CONFIANCE</p><h2>Chaque repas raconte quelque chose<span>.</span></h2><p>Une photo suffit pour mieux comprendre ce qui se trouve dans votre assiette.</p></div>
        <div className="story-visual" aria-hidden="true">
          <div className="plate-ring plate-ring-outer" /><div className="plate-ring plate-ring-inner" /><div className="plate-shape"><div className="plate-leaf leaf-a" /><div className="plate-leaf leaf-b" /><div className="plate-protein" /><div className="plate-grain" /></div>
          <div className="floating-stat floating-stat-top"><span className="stat-icon"><Activity size={15} /></span><div><small>ÉQUILIBRE</small><strong>Repères clairs</strong></div><ArrowUpRight size={15} /></div>
          <div className="floating-stat floating-stat-bottom"><span className="floating-score">A</span><div><small>VOTRE ASSIETTE</small><strong>Analysée en un instant</strong></div></div>
          <div className="visual-caption"><span>IA nutritionnelle</span><span className="caption-dot" /><span>Simplement utile</span></div>
        </div>
        <div className="story-footer"><span>Le plaisir de manger, avec un peu plus de clarté.</span><span>01 — 03</span></div>
      </aside>
    </main>
  )
}

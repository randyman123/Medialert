import type { PropsWithChildren, ReactNode } from 'react'

interface AuthLayoutProps extends PropsWithChildren {
  title: string
  description: string
  badge: string
  footerNote: string
  heroTitle?: string
  heroDescription?: string
  heroBottom?: ReactNode
}

export function AuthLayout({
  children,
  title,
  description,
  badge,
  footerNote,
  heroTitle = 'Atención digital más clara para pacientes y equipos clínicos.',
  heroDescription = 'Una experiencia de salud moderna, simple y conectada para reservas, documentos, telemedicina y seguimiento.',
  heroBottom,
}: AuthLayoutProps) {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <aside className="auth-hero">
          <div className="stack-lg">
            <div className="auth-hero-brand">MediAlert</div>
            <span className="auth-hero-badge">{badge}</span>
          </div>

          <div className="stack-lg">
            <h1 className="auth-hero-title">{heroTitle}</h1>
            <p className="auth-hero-copy">{heroDescription}</p>
          </div>

          {heroBottom ?? (
            <div className="auth-hero-grid">
              <div className="auth-hero-stat">
                <strong>Reservas</strong>
                <span>Agenda presencial y telemedicina en una sola interfaz.</span>
              </div>
              <div className="auth-hero-stat">
                <strong>Seguimiento</strong>
                <span>Pastillero, archivos y continuidad de atención.</span>
              </div>
            </div>
          )}
        </aside>

        <section className="auth-panel">
          <div className="auth-panel-header">
            <p className="auth-panel-kicker">Acceso seguro</p>
            <h2 className="page-title">{title}</h2>
            <p className="page-subtitle">{description}</p>
          </div>

          {children}

          <p className="auth-footnote">{footerNote}</p>
        </section>
      </section>
    </main>
  )
}

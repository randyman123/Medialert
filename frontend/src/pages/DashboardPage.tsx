import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { DashboardLayout } from '../layouts/DashboardLayout'

interface HomeCard {
  title: string
  description: string
  tone: 'primary' | 'secondary'
  to?: string
  disabled?: boolean
  helper?: string
}

interface DashboardSection {
  title: string
  description: string
  cards: HomeCard[]
}

export function DashboardPage() {
  const { logout, role } = useAuth()
  const navigate = useNavigate()
  const isPaciente = role === 'PACIENTE'
  const isRecepcion = role === 'RECEPCION'
  const isAdmin = role === 'ADMIN'

  const sections: DashboardSection[] = isPaciente
    ? [
        {
          title: 'Accesos principales',
          description: 'Tus módulos personales y de atención rápida.',
          cards: [
            {
              title: 'Reservar hora',
              description:
                'Explora especialidades, médicos y próximos horarios disponibles.',
              tone: 'primary',
              to: '/especialidades',
            },
            {
              title: 'Telemedicina',
              description:
                'Reserva atenciones remotas, revisa horarios y entra a videollamadas.',
              tone: 'secondary',
              to: '/telemedicina',
            },
            {
              title: 'Mis reservas',
              description: 'Consulta y cancela tus reservas activas.',
              tone: 'secondary',
              to: '/mis-reservas',
            },
            {
              title: 'Mis archivos',
              description: 'Resultados, recetas y documentos clínicos en un solo lugar.',
              tone: 'secondary',
              to: '/mis-archivos',
            },
            {
              title: 'Pastillero',
              description: 'Organiza tus medicamentos y revisa próximas dosis.',
              tone: 'secondary',
              to: '/pastillero',
            },
          ],
        },
      ]
    : [
        {
          title: isRecepcion ? 'Accesos operativos' : 'Accesos administrativos',
          description:
            isRecepcion
              ? 'Herramientas esenciales para recepción y gestión operativa.'
              : 'Herramientas esenciales para administración y supervisión.',
          cards: [
            {
              title: isRecepcion ? 'Gestión de agenda' : 'Gestión médica',
              description:
                isRecepcion
                  ? 'Revisa especialidades, médicos y disponibilidad para coordinar atención.'
                  : 'Navega por especialidades y médicos desde una vista institucional.',
              tone: 'primary',
              to: '/especialidades',
            },
            {
              title: 'Archivos clínicos',
              description: isRecepcion
                ? 'Consulta archivos clínicos por paciente desde una vista operativa.'
                : 'Espacio institucional para documentación clínica y soporte administrativo.',
              tone: 'secondary',
              to: '/archivos-clinicos',
            },
            {
              title: 'Reportes',
              description: isRecepcion
                ? 'Los reportes institucionales se incorporarán aquí cuando exista una vista dedicada.'
                : 'Espacio preparado para métricas, auditoría y visibilidad ejecutiva.',
              tone: 'secondary',
              disabled: true,
              helper: 'Próximamente',
            },
          ],
        },
      ]

  const handleLogout = () => {
    const confirmed = window.confirm('¿Seguro que quieres salir de MediAlert?')

    if (!confirmed) {
      return
    }

    logout()
    navigate('/login', { replace: true })
  }

  return (
    <DashboardLayout showHeaderLogout={false}>
      <section className="page">
        <section className="hero-banner">
          <p className="hero-eyebrow">Inicio MediAlert</p>
          <h2 className="hero-title">Tu centro de atención médica en un solo lugar</h2>
          <p className="hero-text">
            Gestiona reservas, consulta tus módulos disponibles y accede rápido a las
            acciones principales según tu perfil.
          </p>
          <p className="hero-text" style={{ marginTop: '10px' }}>
            {isPaciente
              ? 'Tienes acceso a tus módulos personales, reservas y seguimiento de atención.'
              : isRecepcion
                ? 'Tu vista prioriza gestión de agenda y acceso institucional sin exponer módulos personales del paciente.'
                : isAdmin
                  ? 'Tu vista muestra accesos administrativos esenciales sin exponer módulos personales del paciente.'
                  : 'Explora los accesos disponibles según tu perfil actual.'}
          </p>
        </section>

        {sections.map((section) => (
          <section key={section.title} className="stack-md">
            <div className="stack-md" style={{ gap: '4px' }}>
              <h3 className="section-heading">{section.title}</h3>
              <p className="section-caption">{section.description}</p>
            </div>
            <div className="cards-grid">
              {section.cards.map((card) => {
                const className = `action-card ${card.tone === 'primary' ? 'action-card-primary' : ''} ${card.disabled ? 'action-card-disabled' : ''}`

                const content = (
                  <>
                    <div>
                      <strong style={{ display: 'block', fontSize: '1.05rem' }}>{card.title}</strong>
                      <p className="data-row-meta" style={{ marginTop: '8px' }}>
                        {card.description}
                      </p>
                    </div>
                    <span className="action-card-label">{card.helper ?? 'Abrir'}</span>
                  </>
                )

                if (card.to && !card.disabled) {
                  return (
                    <Link key={card.title} to={card.to} className={className}>
                      {content}
                    </Link>
                  )
                }

                return (
                  <button key={card.title} type="button" disabled className={className}>
                    {content}
                  </button>
                )
              })}
            </div>
          </section>
        ))}

        <section>
          <button
            type="button"
            onClick={handleLogout}
            className="action-card"
            style={{
              width: '100%',
              borderColor: '#f3c5c2',
              background: '#fff7f7',
              color: '#8f1f18',
              minHeight: 'unset',
            }}
          >
            <div>
              <strong style={{ display: 'block', fontSize: '1rem' }}>Salir</strong>
              <p style={{ margin: '8px 0 0', color: '#ab2f27' }}>
                Cierra tu sesión de forma segura cuando termines de usar la app.
              </p>
            </div>
            <span style={{ fontWeight: 700 }}>Cerrar sesión</span>
          </button>
        </section>
      </section>
    </DashboardLayout>
  )
}

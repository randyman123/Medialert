import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { canViewMisReservas } from '../utils/auth'

interface HomeCard {
  title: string
  description: string
  tone: 'primary' | 'secondary'
  to?: string
  disabled?: boolean
  helper?: string
}

export function DashboardPage() {
  const { logout, role } = useAuth()
  const navigate = useNavigate()
  const showMisReservas = canViewMisReservas(role)

  const mainCards: HomeCard[] = [
    {
      title: 'Reservar hora',
      description: 'Explora especialidades, médicos y próximos horarios disponibles.',
      tone: 'primary',
      to: '/especialidades',
    },
    {
      title: 'Mis reservas',
      description: showMisReservas
        ? 'Consulta y cancela tus reservas activas.'
        : 'Disponible solo para pacientes.',
      tone: 'secondary',
      to: showMisReservas ? '/mis-reservas' : undefined,
      disabled: !showMisReservas,
      helper: showMisReservas ? undefined : 'Restringido por rol',
    },
    {
      title: 'Telemedicina',
      description: 'Acceso rápido a futuras videoconsultas y seguimiento remoto.',
      tone: 'secondary',
      disabled: true,
      helper: 'Próximamente',
    },
    {
      title: 'Mis archivos',
      description: 'Resultados, indicaciones y documentos clínicos en un solo lugar.',
      tone: 'secondary',
      disabled: true,
      helper: showMisReservas ? 'Próximamente' : 'Restringido por rol',
    },
  ]

  const secondaryCards: HomeCard[] = [
    {
      title: 'Mi perfil',
      description: 'Actualiza tus datos personales y de contacto.',
      tone: 'secondary',
      disabled: true,
      helper: 'Próximamente',
    },
    {
      title: 'Mi historial',
      description: 'Revisa atenciones, reservas pasadas y próximos seguimientos.',
      tone: 'secondary',
      disabled: true,
      helper: showMisReservas ? 'Próximamente' : 'Disponible solo para pacientes',
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
    <DashboardLayout>
      <section
        style={{
          padding: '28px',
          borderRadius: '24px',
          background:
            'linear-gradient(135deg, rgba(18, 48, 71, 0.98) 0%, rgba(23, 98, 163, 0.92) 100%)',
          color: '#ffffff',
        }}
      >
        <p style={{ margin: 0, color: '#86efac', fontWeight: 700 }}>
          Inicio MediAlert
        </p>
        <h2 style={{ margin: '8px 0 10px', fontSize: '2rem' }}>
          Tu centro de atención médica en un solo lugar
        </h2>
        <p style={{ margin: 0, maxWidth: '680px', color: 'rgba(255, 255, 255, 0.84)' }}>
          Gestiona reservas, consulta tus módulos disponibles y accede rápido a las
          acciones principales según tu perfil.
        </p>
      </section>

      <section style={{ marginTop: '28px' }}>
        <h3 style={{ margin: '0 0 14px', color: '#123047' }}>Accesos principales</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          {mainCards.map((card) => {
            const cardStyle = {
              display: 'grid',
              gap: '12px',
              minHeight: '172px',
              borderRadius: '20px',
              padding: '20px',
              textDecoration: 'none',
              border:
                card.tone === 'primary'
                  ? '1px solid #bbf7d0'
                  : '1px solid #d9e6f2',
              background:
                card.tone === 'primary'
                  ? 'linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)'
                  : '#ffffff',
              color: '#123047',
              opacity: card.disabled ? 0.72 : 1,
              cursor: card.disabled ? 'not-allowed' : 'pointer',
            } satisfies React.CSSProperties

            const content = (
              <>
                <div>
                  <strong style={{ display: 'block', fontSize: '1.05rem' }}>
                    {card.title}
                  </strong>
                  <p style={{ margin: '8px 0 0', color: '#4f677a' }}>
                    {card.description}
                  </p>
                </div>
                <span style={{ color: '#16a34a', fontWeight: 700 }}>
                  {card.helper ?? 'Abrir'}
                </span>
              </>
            )

            if (card.to && !card.disabled) {
              return (
                <Link key={card.title} to={card.to} style={cardStyle}>
                  {content}
                </Link>
              )
            }

            return (
              <button key={card.title} type="button" disabled style={cardStyle}>
                {content}
              </button>
            )
          })}
        </div>
      </section>

      <section style={{ marginTop: '28px' }}>
        <h3 style={{ margin: '0 0 14px', color: '#123047' }}>Mi espacio</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          {secondaryCards.map((card) => (
            <button
              key={card.title}
              type="button"
              disabled
              style={{
                display: 'grid',
                gap: '12px',
                minHeight: '148px',
                borderRadius: '20px',
                padding: '20px',
                border: '1px solid #d9e6f2',
                backgroundColor: '#ffffff',
                textAlign: 'left',
                color: '#123047',
                opacity: 0.78,
              }}
            >
              <div>
                <strong style={{ display: 'block', fontSize: '1rem' }}>{card.title}</strong>
                <p style={{ margin: '8px 0 0', color: '#4f677a' }}>
                  {card.description}
                </p>
              </div>
              <span style={{ color: '#16a34a', fontWeight: 700 }}>
                {card.helper ?? 'Próximamente'}
              </span>
            </button>
          ))}

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'grid',
              gap: '12px',
              minHeight: '148px',
              borderRadius: '20px',
              padding: '20px',
              border: '1px solid #fecaca',
              backgroundColor: '#fff7f7',
              textAlign: 'left',
              color: '#991b1b',
              cursor: 'pointer',
            }}
          >
            <div>
              <strong style={{ display: 'block', fontSize: '1rem' }}>Salir</strong>
              <p style={{ margin: '8px 0 0', color: '#b91c1c' }}>
                Cierra tu sesión de forma segura cuando termines de usar la app.
              </p>
            </div>
            <span style={{ fontWeight: 700 }}>Cerrar sesión</span>
          </button>
        </div>
      </section>
    </DashboardLayout>
  )
}

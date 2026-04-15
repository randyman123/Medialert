import type { PropsWithChildren } from 'react'
import { useNavigate } from 'react-router-dom'
import { WhatsAppFloatingButton } from '../components/WhatsAppFloatingButton'
import { useAuth } from '../hooks/useAuth'

interface DashboardLayoutProps extends PropsWithChildren {
  showHeaderLogout?: boolean
}

export function DashboardLayout({
  children,
  showHeaderLogout = true,
}: DashboardLayoutProps) {
  const { logout, userName } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    const confirmed = window.confirm('¿Seguro que quieres salir de MediAlert?')

    if (!confirmed) {
      return
    }

    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main style={{ minHeight: '100vh', padding: '24px' }}>
      <div
        className="panel panel-elevated"
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 20px 60px rgba(18, 48, 71, 0.12)',
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '28px',
            flexWrap: 'wrap',
          }}
        >
          <div className="stack-md" style={{ gap: '4px' }}>
            <p style={{ margin: 0, color: '#0e7490', fontWeight: 700 }}>MediAlert</p>
            <h1 className="page-title">Inicio</h1>
            <p style={{ margin: 0, color: '#4f677a' }}>Hola, {userName}.</p>
          </div>

          {showHeaderLogout ? (
            <button type="button" onClick={handleLogout} className="btn btn-secondary">
              Salir
            </button>
          ) : null}
        </header>

        {children}

        <footer
          style={{
            marginTop: '40px',
            paddingTop: '24px',
            borderTop: '1px solid #d9e6f2',
            display: 'grid',
            gap: '12px',
            color: '#4f677a',
          }}
        >
          <strong style={{ color: '#123047' }}>
            MediAlert - Sistema de gestión de salud municipal
          </strong>
          <span>
            Sobre nosotros: plataforma ficticia orientada a coordinar atención,
            seguimiento y acceso digital para pacientes y equipos de salud comunal.
          </span>
          <span>
            Contacto: contacto@medialert.cl | +56 2 2456 7800 | Redes: @MediAlertSalud
          </span>
        </footer>
      </div>

      <WhatsAppFloatingButton />
    </main>
  )
}

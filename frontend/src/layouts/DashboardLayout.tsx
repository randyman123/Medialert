import type { PropsWithChildren } from 'react'
import { useNavigate } from 'react-router-dom'
import { WhatsAppFloatingButton } from '../components/WhatsAppFloatingButton'
import { useAuth } from '../hooks/useAuth'

export function DashboardLayout({ children }: PropsWithChildren) {
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
        style={{
          maxWidth: '1080px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
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
            marginBottom: '32px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p style={{ margin: 0, color: '#16a34a', fontWeight: 700 }}>
              MediAlert
            </p>
            <h1 style={{ margin: '8px 0 0', fontSize: '2rem' }}>Inicio</h1>
            <p style={{ margin: '8px 0 0', color: '#4f677a' }}>
              Hola, {userName} 👋
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              border: 0,
              borderRadius: '12px',
              padding: '12px 18px',
              backgroundColor: '#123047',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            Salir
          </button>
        </header>

        {children}
      </div>

      <WhatsAppFloatingButton />
    </main>
  )
}

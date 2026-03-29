import type { PropsWithChildren } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function DashboardLayout({ children }: PropsWithChildren) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main style={{ minHeight: '100vh', padding: '24px' }}>
      <div
        style={{
          maxWidth: '960px',
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
            <h1 style={{ margin: '8px 0 0', fontSize: '2rem' }}>Dashboard</h1>
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
            Cerrar sesión
          </button>
        </header>

        {children}
      </div>
    </main>
  )
}

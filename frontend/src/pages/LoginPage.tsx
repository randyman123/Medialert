import { Navigate } from 'react-router-dom'
import { LoginForm } from '../components/LoginForm'
import { useAuth } from '../hooks/useAuth'
import { AuthLayout } from '../layouts/AuthLayout'

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <p style={{ padding: '24px' }}>Cargando...</p>
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <AuthLayout>
      <div>
        <p style={{ margin: 0, color: '#16a34a', fontWeight: 700 }}>MediAlert</p>
        <h1 style={{ margin: '8px 0 12px', fontSize: '2rem', color: '#123047' }}>
          Iniciar sesión
        </h1>
        <p style={{ margin: 0, color: '#5b7285' }}>
          Accede al frontend conectado con tu backend NestJS.
        </p>
      </div>

      <LoginForm />
    </AuthLayout>
  )
}

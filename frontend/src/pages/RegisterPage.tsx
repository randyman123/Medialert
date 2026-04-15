import { Navigate } from 'react-router-dom'
import { RegisterForm } from '../components/RegisterForm'
import { useAuth } from '../hooks/useAuth'
import { AuthLayout } from '../layouts/AuthLayout'

export function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <p style={{ padding: '24px' }}>Cargando...</p>
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <AuthLayout>
      <div className="stack-md" style={{ gap: '6px' }}>
        <p style={{ margin: 0, color: '#0e7490', fontWeight: 700 }}>MediAlert</p>
        <h1 className="page-title" style={{ fontSize: '1.9rem' }}>
          Crear cuenta
        </h1>
        <p className="page-subtitle">
          Registra un nuevo paciente para probar el frontend conectado con tu backend.
        </p>
      </div>

      <RegisterForm />
    </AuthLayout>
  )
}

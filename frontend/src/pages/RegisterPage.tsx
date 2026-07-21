import { Navigate } from 'react-router-dom'
import { RegisterForm } from '../components/RegisterForm'
import { useAuth } from '../hooks/useAuth'
import { AuthLayout } from '../layouts/AuthLayout'

export function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <main className="auth-loading">Cargando...</main>
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <AuthLayout
      title="Crear cuenta"
      description="Registra un nuevo paciente para probar el frontend sin cambiar contratos ni autenticación."
      badge="Registro de paciente"
      footerNote="El registro mantiene el flujo actual y luego te lleva de vuelta al inicio de sesión."
      heroTitle="Un acceso claro desde el primer minuto también mejora la percepción del producto."
      heroDescription="El rediseño conserva la lógica existente, pero ordena visualmente el ingreso, el registro y la continuidad hacia el dashboard."
    >
      <RegisterForm />
    </AuthLayout>
  )
}

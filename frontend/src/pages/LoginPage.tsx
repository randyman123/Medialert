import { Navigate } from 'react-router-dom'
import { LoginForm } from '../components/LoginForm'
import { useAuth } from '../hooks/useAuth'
import { AuthLayout } from '../layouts/AuthLayout'

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <main className="auth-loading">Cargando...</main>
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <AuthLayout
      title="Iniciar sesión"
      description="Accede al frontend conectado con tu backend NestJS y continúa donde quedaste."
      badge="Portal clínico"
      footerNote="Tu sesión conserva la autenticación actual y la conexión existente con el backend."
      heroTitle="Una experiencia de salud digital más ordenada, clara y presentable."
      heroDescription="MediAlert reúne reservas, telemedicina, documentos y seguimiento en una interfaz institucional más limpia sin alterar el funcionamiento del sistema."
    >
      <LoginForm />

      <section className="demo-credentials">
        <p><strong>Credenciales demo</strong></p>
        <p>Admin: <code>admin@medialert.cl</code> / <code>123456</code></p>
        <p>Paciente: <code>paciente@medialert.cl</code> / <code>123456</code></p>
      </section>
    </AuthLayout>
  )
}

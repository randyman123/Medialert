import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [correo, setCorreo] = useState(
    (location.state as { registeredEmail?: string } | null)?.registeredEmail ?? '',
  )
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login({ correo, contrasena })
      navigate('/dashboard', { replace: true })
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : 'No se pudo iniciar sesión'

      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <label className="form-label">
        Correo
        <input
          className="field"
          type="email"
          value={correo}
          onChange={(event) => setCorreo(event.target.value)}
          placeholder="correo@medialert.com"
          required
        />
      </label>

      <label className="form-label">
        Contraseña
        <input
          className="field"
          type="password"
          value={contrasena}
          onChange={(event) => setContrasena(event.target.value)}
          placeholder="Tu contraseña"
          required
          minLength={6}
        />
      </label>

      {error ? <p className="alert alert-error">{error}</p> : null}

      <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-block">
        {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
      </button>

      <p className="auth-footnote">
        ¿Aún no tienes cuenta?{' '}
        <Link to="/register" className="auth-inline-link">
          Registrarse
        </Link>
      </p>
    </form>
  )
}

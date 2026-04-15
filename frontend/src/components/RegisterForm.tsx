import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isValidEmail } from '../utils/validation'

export function RegisterForm() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validationMessage = useMemo(() => {
    if (nombreCompleto.trim().length > 0 && nombreCompleto.trim().length < 3) {
      return 'El nombre completo debe tener al menos 3 caracteres.'
    }

    if (correo.trim().length > 0 && !isValidEmail(correo.trim())) {
      return 'Debes ingresar un correo válido.'
    }

    if (contrasena.length > 0 && contrasena.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.'
    }

    return ''
  }, [correo, contrasena, nombreCompleto])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')

    const nombre = nombreCompleto.trim()
    const email = correo.trim().toLowerCase()

    if (nombre.length < 3) {
      setError('El nombre completo debe tener al menos 3 caracteres')
      return
    }

    if (!isValidEmail(email)) {
      setError('Debes ingresar un correo válido')
      return
    }

    if (contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        nombreCompleto: nombre,
        correo: email,
        contrasena,
      })

      setSuccessMessage('Cuenta creada correctamente. Ahora puedes iniciar sesión.')
      window.setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { registeredEmail: email },
        })
      }, 900)
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'No se pudo completar el registro'

      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: '24px' }}>
      <label className="form-label">
        Nombre completo
        <input
          className="field"
          type="text"
          value={nombreCompleto}
          onChange={(event) => setNombreCompleto(event.target.value)}
          placeholder="Juan Pérez"
          required
        />
      </label>

      <label className="form-label">
        Correo
        <input
          className="field"
          type="email"
          value={correo}
          onChange={(event) => setCorreo(event.target.value)}
          placeholder="juan@correo.cl"
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
          placeholder="Mínimo 6 caracteres"
          required
          minLength={6}
        />
      </label>

      {validationMessage && !error ? <p className="alert alert-info">{validationMessage}</p> : null}
      {error ? <p className="alert alert-error">{error}</p> : null}
      {successMessage ? <p className="alert alert-success">{successMessage}</p> : null}

      <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-block">
        {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>

      <p className="auth-footnote">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="page-nav-link">
          Inicia sesión
        </Link>
      </p>
    </form>
  )
}

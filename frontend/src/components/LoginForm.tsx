import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [correo, setCorreo] = useState('')
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
        submitError instanceof Error
          ? submitError.message
          : 'No se pudo iniciar sesión'

      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'grid', gap: '16px', marginTop: '24px' }}
    >
      <label style={{ display: 'grid', gap: '8px', color: '#355266' }}>
        Correo
        <input
          type="email"
          value={correo}
          onChange={(event) => setCorreo(event.target.value)}
          placeholder="correo@medialert.com"
          required
          style={{
            border: '1px solid #cfd9e2',
            borderRadius: '12px',
            padding: '14px 16px',
          }}
        />
      </label>

      <label style={{ display: 'grid', gap: '8px', color: '#355266' }}>
        Contraseña
        <input
          type="password"
          value={contrasena}
          onChange={(event) => setContrasena(event.target.value)}
          placeholder="Tu contraseña"
          required
          minLength={6}
          style={{
            border: '1px solid #cfd9e2',
            borderRadius: '12px',
            padding: '14px 16px',
          }}
        />
      </label>

      {error ? (
        <p
          style={{
            margin: 0,
            padding: '12px 14px',
            borderRadius: '12px',
            backgroundColor: '#fef2f2',
            color: '#b91c1c',
          }}
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          border: 0,
          borderRadius: '12px',
          padding: '14px 18px',
          backgroundColor: '#16a34a',
          color: '#ffffff',
          fontWeight: 700,
          cursor: isSubmitting ? 'wait' : 'pointer',
        }}
      >
        {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
      </button>
    </form>
  )
}

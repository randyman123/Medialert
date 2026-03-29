import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { agendaService } from '../services/agenda.service'
import type { BloqueDisponible } from '../services/medicos.service'
import { reservasService } from '../services/reservas.service'

function getToday() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatHour(value: string) {
  return new Date(value).toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AgendaPage() {
  const [searchParams] = useSearchParams()
  const medicoId = searchParams.get('medicoId')
  const medicoNombre = searchParams.get('medicoNombre') ?? ''
  const especialidadId = searchParams.get('especialidadId') ?? ''
  const especialidadNombre = searchParams.get('especialidadNombre') ?? ''
  const [fecha, setFecha] = useState(getToday)
  const [bloques, setBloques] = useState<BloqueDisponible[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedBloqueId, setSelectedBloqueId] = useState<number | null>(null)
  const [motivo, setMotivo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (!medicoId) {
      setError('Debes seleccionar un médico primero')
      setIsLoading(false)
      return
    }

    const cargarAgenda = async () => {
      setIsLoading(true)
      setError('')

      try {
        const data = await agendaService.obtenerPorMedicoYFecha(
          Number(medicoId),
          fecha,
        )

        setBloques(data.bloques)
        setSelectedBloqueId(null)
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : 'No se pudo cargar la agenda'

        setError(message)
        setBloques([])
      } finally {
        setIsLoading(false)
      }
    }

    void cargarAgenda()
  }, [fecha, medicoId])

  const handleReservar = async () => {
    if (!selectedBloqueId) {
      setSubmitError('Debes seleccionar un bloque disponible')
      return
    }

    if (motivo.trim().length < 3) {
      setSubmitError('El motivo debe tener al menos 3 caracteres')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    setSuccessMessage('')

    try {
      await reservasService.crear({
        bloqueHorarioId: selectedBloqueId,
        motivo: motivo.trim(),
      })

      setSuccessMessage('Reserva creada correctamente')
      setMotivo('')

      const data = await agendaService.obtenerPorMedicoYFecha(Number(medicoId), fecha)
      setBloques(data.bloques)
      setSelectedBloqueId(null)
    } catch (reservationError) {
      const message =
        reservationError instanceof Error
          ? reservationError.message
          : 'No se pudo crear la reserva'

      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <section>
        <h2 style={{ marginTop: 0, color: '#123047' }}>Agenda disponible</h2>
        <p style={{ color: '#4f677a', marginBottom: '8px' }}>
          Especialidad: <strong>{especialidadNombre || 'Sin especialidad'}</strong>
        </p>
        <p style={{ color: '#4f677a', marginTop: 0 }}>
          Médico: <strong>{medicoNombre || 'Sin médico seleccionado'}</strong>
        </p>

        <div style={{ margin: '16px 0 20px' }}>
          <Link
            to={`/medicos?especialidadId=${especialidadId}&especialidadNombre=${encodeURIComponent(especialidadNombre)}`}
            style={{ color: '#16a34a' }}
          >
            Cambiar médico
          </Link>
        </div>

        <label style={{ display: 'grid', gap: '8px', maxWidth: '240px' }}>
          Fecha
          <input
            type="date"
            value={fecha}
            onChange={(event) => setFecha(event.target.value)}
            style={{
              border: '1px solid #cfd9e2',
              borderRadius: '12px',
              padding: '12px 14px',
            }}
          />
        </label>

        {isLoading ? <p style={{ marginTop: '20px' }}>Cargando agenda...</p> : null}
        {error ? <p style={{ color: '#b91c1c', marginTop: '20px' }}>{error}</p> : null}

        {!isLoading && !error ? (
          bloques.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px', marginTop: '24px' }}>
              {bloques.map((bloque) => (
                <button
                  key={bloque.id}
                  type="button"
                  onClick={() => {
                    setSelectedBloqueId(bloque.id)
                    setSubmitError('')
                    setSuccessMessage('')
                  }}
                  style={{
                    border: '1px solid #d9e6f2',
                    backgroundColor:
                      selectedBloqueId === bloque.id ? '#e8f7ee' : '#ffffff',
                    borderRadius: '14px',
                    padding: '16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <strong style={{ display: 'block', color: '#123047' }}>
                    {formatHour(bloque.inicio)} - {formatHour(bloque.fin)}
                  </strong>
                  <span style={{ color: '#4f677a' }}>{bloque.estado}</span>
                </button>
              ))}
            </div>
          ) : (
            <p style={{ marginTop: '24px' }}>
              No hay bloques disponibles para la fecha seleccionada.
            </p>
          )
        ) : null}

        {!isLoading && !error && bloques.length > 0 ? (
          <section
            style={{
              marginTop: '28px',
              padding: '20px',
              borderRadius: '16px',
              backgroundColor: '#f8fafc',
              border: '1px solid #d9e6f2',
            }}
          >
            <h3 style={{ marginTop: 0, color: '#123047' }}>Reservar bloque</h3>

            <label style={{ display: 'grid', gap: '8px' }}>
              Motivo
              <input
                type="text"
                value={motivo}
                onChange={(event) => setMotivo(event.target.value)}
                placeholder="Ej: control general"
                style={{
                  border: '1px solid #cfd9e2',
                  borderRadius: '12px',
                  padding: '12px 14px',
                }}
              />
            </label>

            {successMessage ? (
              <p style={{ color: '#15803d', marginTop: '16px' }}>{successMessage}</p>
            ) : null}
            {submitError ? (
              <p style={{ color: '#b91c1c', marginTop: '16px' }}>{submitError}</p>
            ) : null}

            <button
              type="button"
              onClick={handleReservar}
              disabled={isSubmitting}
              style={{
                marginTop: '16px',
                border: 0,
                borderRadius: '12px',
                padding: '12px 18px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                cursor: isSubmitting ? 'wait' : 'pointer',
              }}
            >
              {isSubmitting ? 'Reservando...' : 'Reservar'}
            </button>
          </section>
        ) : null}
      </section>
    </DashboardLayout>
  )
}

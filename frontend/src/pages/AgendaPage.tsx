import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { agendaService } from '../services/agenda.service'
import type { BloqueDisponible } from '../services/medicos.service'
import { reservasService } from '../services/reservas.service'
import { formatDateLabel, formatHour } from '../utils/format'

function getToday() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function addDays(value: string, days: number) {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, (month ?? 1) - 1, day ?? 1)
  date.setDate(date.getDate() + days)

  const nextYear = date.getFullYear()
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0')
  const nextDay = String(date.getDate()).padStart(2, '0')

  return `${nextYear}-${nextMonth}-${nextDay}`
}

function getUpcomingDates(startDate: string, total = 7) {
  return Array.from({ length: total }, (_, index) => addDays(startDate, index))
}

interface AvailableDay {
  fecha: string
  bloques: BloqueDisponible[]
}

interface ReservationConfirmation {
  fecha: string
  inicio: string
  fin: string
}

export function AgendaPage() {
  const [searchParams] = useSearchParams()
  const medicoId = searchParams.get('medicoId')
  const medicoNombre = searchParams.get('medicoNombre') ?? ''
  const especialidadId = searchParams.get('especialidadId') ?? ''
  const especialidadNombre = searchParams.get('especialidadNombre') ?? ''
  const [fecha, setFecha] = useState(getToday)
  const [availableDays, setAvailableDays] = useState<AvailableDay[]>([])
  const [bloques, setBloques] = useState<BloqueDisponible[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedBloqueId, setSelectedBloqueId] = useState<number | null>(null)
  const [motivo, setMotivo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [confirmation, setConfirmation] = useState<ReservationConfirmation | null>(
    null,
  )

  const updateAvailableDays = (nextFecha: string, nextBloques: BloqueDisponible[]) => {
    setAvailableDays((current) => {
      const withoutCurrentDate = current.filter((day) => day.fecha !== nextFecha)

      if (nextBloques.length === 0) {
        return withoutCurrentDate
      }

      return [...withoutCurrentDate, { fecha: nextFecha, bloques: nextBloques }].sort(
        (left, right) => left.fecha.localeCompare(right.fecha),
      )
    })
  }

  const loadAgendaForDate = async (nextFecha: string) => {
    if (!medicoId) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const data = await agendaService.obtenerPorMedicoYFecha(Number(medicoId), nextFecha)
      setFecha(nextFecha)
      setBloques(data.bloques)
      setSelectedBloqueId(null)
      updateAvailableDays(nextFecha, data.bloques)
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : 'No se pudo cargar la agenda'

      setError(message)
      setBloques([])
      setSelectedBloqueId(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!medicoId) {
      setError('Debes seleccionar un médico primero')
      setIsLoading(false)
      return
    }

    const cargarAgenda = async () => {
      setIsLoading(true)
      setError('')
      setBloques([])
      setAvailableDays([])
      setSelectedBloqueId(null)

      try {
        const upcomingDates = getUpcomingDates(getToday())
        const results = await Promise.allSettled(
          upcomingDates.map(async (nextFecha) => {
            const data = await agendaService.obtenerPorMedicoYFecha(
              Number(medicoId),
              nextFecha,
            )

            return {
              fecha: nextFecha,
              bloques: data.bloques,
            }
          }),
        )

        const successfulDays = results
          .filter(
            (
              result,
            ): result is PromiseFulfilledResult<{
              fecha: string
              bloques: BloqueDisponible[]
            }> => result.status === 'fulfilled',
          )
          .map((result) => result.value)

        if (successfulDays.length === 0) {
          throw new Error('No se pudo cargar la agenda')
        }

        const nextAvailableDays = successfulDays.filter(
          (day) => day.bloques.length > 0,
        )

        setAvailableDays(nextAvailableDays)

        if (nextAvailableDays[0]) {
          setFecha(nextAvailableDays[0].fecha)
          setBloques(nextAvailableDays[0].bloques)
        } else {
          setFecha(upcomingDates[0] ?? getToday())
          setBloques([])
        }
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
  }, [medicoId])

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
    setConfirmation(null)

    try {
      const selectedBloque = bloques.find((bloque) => bloque.id === selectedBloqueId)

      await reservasService.crear({
        bloqueHorarioId: selectedBloqueId,
        motivo: motivo.trim(),
      })

      if (selectedBloque) {
        setConfirmation({
          fecha,
          inicio: selectedBloque.inicio,
          fin: selectedBloque.fin,
        })
      }

      setMotivo('')

      const data = await agendaService.obtenerPorMedicoYFecha(Number(medicoId), fecha)
      setBloques(data.bloques)
      setSelectedBloqueId(null)
      updateAvailableDays(fecha, data.bloques)
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

        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            margin: '16px 0 20px',
          }}
        >
          <Link to="/dashboard" style={{ color: '#16a34a' }}>
            Volver al dashboard
          </Link>
          <Link to="/especialidades" style={{ color: '#16a34a' }}>
            Volver a especialidades
          </Link>
          <Link
            to={`/medicos?especialidadId=${especialidadId}&especialidadNombre=${encodeURIComponent(especialidadNombre)}`}
            style={{ color: '#16a34a' }}
          >
            Volver a médicos
          </Link>
        </div>

        {confirmation ? (
          <section
            style={{
              marginBottom: '20px',
              padding: '20px',
              borderRadius: '16px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #86efac',
            }}
          >
            <h3 style={{ margin: '0 0 8px', color: '#166534' }}>
              Reserva confirmada
            </h3>
            <p style={{ margin: 0, color: '#166534' }}>
              Tu hora con <strong>{medicoNombre}</strong> quedó agendada para{' '}
              <strong>{formatDateLabel(confirmation.fecha)}</strong>, de{' '}
              <strong>{formatHour(confirmation.inicio)}</strong> a{' '}
              <strong>{formatHour(confirmation.fin)}</strong>.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                marginTop: '16px',
              }}
            >
              <Link to="/mis-reservas" style={{ color: '#166534', fontWeight: 700 }}>
                Ir a mis reservas
              </Link>
              <Link to="/dashboard" style={{ color: '#166534', fontWeight: 700 }}>
                Volver al dashboard
              </Link>
            </div>
          </section>
        ) : null}

        <section
          style={{
            padding: '20px',
            borderRadius: '16px',
            backgroundColor: '#f8fafc',
            border: '1px solid #d9e6f2',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#123047' }}>Próximas fechas disponibles</h3>

          {availableDays.length > 0 ? (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {availableDays.map((day) => (
                <button
                  key={day.fecha}
                  type="button"
                  onClick={() => {
                    setFecha(day.fecha)
                    setBloques(day.bloques)
                    setSelectedBloqueId(null)
                    setSubmitError('')
                    setConfirmation(null)
                  }}
                  style={{
                    border: `1px solid ${fecha === day.fecha ? '#16a34a' : '#d9e6f2'}`,
                    backgroundColor: fecha === day.fecha ? '#e8f7ee' : '#ffffff',
                    borderRadius: '999px',
                    padding: '10px 14px',
                    cursor: 'pointer',
                  }}
                >
                  {formatDateLabel(day.fecha)} ({day.bloques.length})
                </button>
              ))}
            </div>
          ) : (
            <p style={{ marginBottom: '16px', color: '#4f677a' }}>
              No encontramos bloques en los próximos 7 días. Puedes revisar otra
              fecha manualmente.
            </p>
          )}

          <label
            style={{
              display: 'grid',
              gap: '8px',
              maxWidth: '240px',
              marginTop: '20px',
            }}
          >
            Buscar otra fecha
            <input
              type="date"
              value={fecha}
              onChange={(event) => {
                void loadAgendaForDate(event.target.value)
              }}
              style={{
                border: '1px solid #cfd9e2',
                borderRadius: '12px',
                padding: '12px 14px',
              }}
            />
          </label>
        </section>

        {isLoading ? <p style={{ marginTop: '20px' }}>Cargando agenda...</p> : null}
        {error ? <p style={{ color: '#b91c1c', marginTop: '20px' }}>{error}</p> : null}

        {!isLoading && !error ? (
          bloques.length > 0 ? (
            <>
              <p style={{ color: '#4f677a', marginTop: '24px', marginBottom: '12px' }}>
                Bloques para <strong>{formatDateLabel(fecha)}</strong>
              </p>
              <div style={{ display: 'grid', gap: '12px', marginTop: '24px' }}>
                {bloques.map((bloque) => (
                  <button
                    key={bloque.id}
                    type="button"
                    onClick={() => {
                      setSelectedBloqueId(bloque.id)
                      setSubmitError('')
                      setConfirmation(null)
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
            </>
          ) : (
            <section
              style={{
                marginTop: '24px',
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: '#f8fafc',
                border: '1px solid #d9e6f2',
              }}
            >
              <p style={{ margin: 0, color: '#4f677a' }}>
                No hay bloques disponibles para <strong>{formatDateLabel(fecha)}</strong>.
                {availableDays.length > 0
                  ? ' Puedes elegir una de las próximas fechas sugeridas.'
                  : ' Intenta con otra fecha manualmente.'}
              </p>
            </section>
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

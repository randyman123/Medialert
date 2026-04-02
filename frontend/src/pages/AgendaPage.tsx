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
  const [fechaSeleccionada, setFechaSeleccionada] = useState('')
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

  useEffect(() => {
    if (!medicoId) {
      setError('Debes seleccionar un médico primero')
      setIsLoading(false)
      return
    }

    const cargarAgenda = async () => {
      setIsLoading(true)
      setError('')
      setAvailableDays([])
      setBloques([])
      setFechaSeleccionada('')
      setSelectedBloqueId(null)

      try {
        const upcomingDates = getUpcomingDates(getToday())
        const results = await Promise.allSettled(
          upcomingDates.map(async (fecha) => {
            const data = await agendaService.obtenerPorMedicoYFecha(
              Number(medicoId),
              fecha,
            )

            return {
              fecha,
              bloques: data.bloques,
            }
          }),
        )

        const nextAvailableDays = results
          .filter(
            (
              result,
            ): result is PromiseFulfilledResult<AvailableDay> =>
              result.status === 'fulfilled',
          )
          .map((result) => result.value)
          .filter((day) => day.bloques.length > 0)

        setAvailableDays(nextAvailableDays)

        if (nextAvailableDays[0]) {
          setFechaSeleccionada(nextAvailableDays[0].fecha)
          setBloques(nextAvailableDays[0].bloques)
        }
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : 'No se pudo cargar la agenda'

        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void cargarAgenda()
  }, [medicoId])

  useEffect(() => {
    if (!availableDays.length) {
      setBloques([])
      return
    }

    const currentDay =
      availableDays.find((day) => day.fecha === fechaSeleccionada) ?? availableDays[0]

    if (!currentDay) {
      return
    }

    setFechaSeleccionada(currentDay.fecha)
    setBloques(currentDay.bloques)
  }, [availableDays, fechaSeleccionada])

  const handleSelectDay = (day: AvailableDay) => {
    setFechaSeleccionada(day.fecha)
    setBloques(day.bloques)
    setSelectedBloqueId(null)
    setSubmitError('')
    setConfirmation(null)
  }

  const handleReservar = async () => {
    if (!selectedBloqueId) {
      setSubmitError('Debes seleccionar un horario disponible')
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
          fecha: fechaSeleccionada,
          inicio: selectedBloque.inicio,
          fin: selectedBloque.fin,
        })
      }

      const refreshed = await agendaService.obtenerPorMedicoYFecha(
        Number(medicoId),
        fechaSeleccionada,
      )

      setAvailableDays((current) =>
        current
          .map((day) =>
            day.fecha === fechaSeleccionada
              ? { ...day, bloques: refreshed.bloques }
              : day,
          )
          .filter((day) => day.bloques.length > 0),
      )

      setMotivo('')
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

        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            margin: '16px 0 24px',
          }}
        >
          <Link to="/dashboard" style={{ color: '#16a34a' }}>
            Volver al inicio
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
              marginBottom: '24px',
              padding: '20px',
              borderRadius: '18px',
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
                Volver al inicio
              </Link>
            </div>
          </section>
        ) : null}

        {isLoading ? <p>Cargando disponibilidad...</p> : null}
        {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}

        {!isLoading && !error ? (
          availableDays.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gap: '20px',
                gridTemplateColumns: 'minmax(240px, 320px) minmax(0, 1fr)',
                alignItems: 'start',
              }}
            >
              <section
                style={{
                  padding: '20px',
                  borderRadius: '18px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #d9e6f2',
                }}
              >
                <h3 style={{ marginTop: 0, color: '#123047' }}>Días disponibles</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {availableDays.map((day) => (
                    <button
                      key={day.fecha}
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      style={{
                        border:
                          fechaSeleccionada === day.fecha
                            ? '1px solid #16a34a'
                            : '1px solid #d9e6f2',
                        backgroundColor:
                          fechaSeleccionada === day.fecha ? '#e8f7ee' : '#ffffff',
                        borderRadius: '14px',
                        padding: '14px 16px',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <strong style={{ display: 'block', color: '#123047' }}>
                        {formatDateLabel(day.fecha)}
                      </strong>
                      <span style={{ color: '#4f677a' }}>
                        {day.bloques.length} horarios disponibles
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section
                style={{
                  padding: '20px',
                  borderRadius: '18px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d9e6f2',
                }}
              >
                <h3 style={{ marginTop: 0, color: '#123047' }}>Horarios del día seleccionado</h3>
                <p style={{ color: '#4f677a', marginTop: 0 }}>
                  {fechaSeleccionada
                    ? `Mostrando horarios para ${formatDateLabel(fechaSeleccionada)}.`
                    : 'Selecciona un día para ver sus horarios.'}
                </p>

                <div style={{ display: 'grid', gap: '12px', marginTop: '20px' }}>
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

                {bloques.length > 0 ? (
                  <section
                    style={{
                      marginTop: '24px',
                      padding: '20px',
                      borderRadius: '16px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #d9e6f2',
                    }}
                  >
                    <h4 style={{ marginTop: 0, color: '#123047' }}>Reservar horario</h4>

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
            </div>
          ) : (
            <section
              style={{
                padding: '24px',
                borderRadius: '18px',
                backgroundColor: '#f8fafc',
                border: '1px solid #d9e6f2',
              }}
            >
              <h3 style={{ marginTop: 0, color: '#123047' }}>
                Sin horarios próximos disponibles
              </h3>
              <p style={{ margin: 0, color: '#4f677a' }}>
                Este médico no tiene horas visibles en los próximos días. Puedes volver
                a médicos y revisar otra opción.
              </p>
            </section>
          )
        ) : null}
      </section>
    </DashboardLayout>
  )
}

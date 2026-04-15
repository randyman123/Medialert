import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { DashboardLayout } from '../layouts/DashboardLayout'
import type { BloqueDisponible } from '../services/medicos.service'
import { telemedicinaService } from '../services/telemedicina.service'
import type { Reserva } from '../services/reservas.service'
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

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`
}

function getUpcomingDates(startDate: string, total = 7) {
  return Array.from({ length: total }, (_, index) => addDays(startDate, index))
}

interface AvailableDay {
  fecha: string
  bloques: BloqueDisponible[]
}

interface TelemedicinaConfirmation {
  fecha: string
  inicio: string
  fin: string
  linkTelemedicina?: string | null
}

export function TelemedicinaAgendaPage() {
  const { medicoId } = useParams()
  const [searchParams] = useSearchParams()
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
  const [observaciones, setObservaciones] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [confirmation, setConfirmation] = useState<TelemedicinaConfirmation | null>(null)
  const [lastReservation, setLastReservation] = useState<Reserva | null>(null)

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
            const data = await telemedicinaService.listarHorarios(Number(medicoId), fecha)

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
            ): result is PromiseFulfilledResult<AvailableDay> => result.status === 'fulfilled',
          )
          .map((result) => result.value)
          .filter((day) => day.bloques.length > 0)

        setAvailableDays(nextAvailableDays)

        if (nextAvailableDays[0]) {
          setFechaSeleccionada(nextAvailableDays[0].fecha)
          setBloques(nextAvailableDays[0].bloques)
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'No se pudo cargar la agenda de telemedicina',
        )
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
    setLastReservation(null)
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

      const reserva = await telemedicinaService.reservar({
        bloqueHorarioId: selectedBloqueId,
        motivo: motivo.trim(),
        observaciones: observaciones.trim() || undefined,
        generarSalaAutomaticamente: true,
      })

      setLastReservation(reserva)

      if (selectedBloque) {
        setConfirmation({
          fecha: fechaSeleccionada,
          inicio: selectedBloque.inicio,
          fin: selectedBloque.fin,
          linkTelemedicina: reserva.linkTelemedicina ?? null,
        })
      }

      const refreshed = await telemedicinaService.listarHorarios(
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
      setObservaciones('')
      setSelectedBloqueId(null)
    } catch (reservationError) {
      setSubmitError(
        reservationError instanceof Error
          ? reservationError.message
          : 'No se pudo reservar la telemedicina',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <section className="page">
        <h2 className="page-title">Agenda de telemedicina</h2>
        <p className="page-subtitle" style={{ marginBottom: '8px' }}>
          Especialidad: <strong>{especialidadNombre || 'Sin especialidad'}</strong>
        </p>
        <p className="page-subtitle" style={{ marginTop: 0 }}>
          Médico: <strong>{medicoNombre || 'Sin médico seleccionado'}</strong>
        </p>

        <div className="page-nav">
          <Link to="/dashboard" className="page-nav-link">
            Volver al inicio
          </Link>
          <Link to="/telemedicina" className="page-nav-link">
            Volver a telemedicina
          </Link>
          <Link
            to={`/telemedicina/medicos/${medicoId ? especialidadId : ''}?especialidadNombre=${encodeURIComponent(especialidadNombre)}`}
            className="page-nav-link"
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
              Telemedicina confirmada
            </h3>
            <p style={{ margin: 0, color: '#166534' }}>
              Tu atención remota con <strong>{medicoNombre}</strong> quedó agendada para{' '}
              <strong>{formatDateLabel(confirmation.fecha)}</strong>, de{' '}
              <strong>{formatHour(confirmation.inicio)}</strong> a{' '}
              <strong>{formatHour(confirmation.fin)}</strong>.
            </p>
            <div style={{ marginTop: '14px', display: 'grid', gap: '10px' }}>
              {confirmation.linkTelemedicina ? (
                <>
                  <p style={{ margin: 0, color: '#166534' }}>
                    La sala ya está disponible para tu teleconsulta.
                  </p>
                  <div className="data-row-actions">
                    <a
                      href={confirmation.linkTelemedicina}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary"
                    >
                      Entrar a videollamada
                    </a>
                  </div>
                </>
              ) : (
                <p style={{ margin: 0, color: '#166534' }}>
                  Aún no hay link de sala disponible. Cuando se genere, podrás verlo en
                  esta confirmación y también en Mis reservas.
                </p>
              )}
            </div>
          </section>
        ) : null}

        {isLoading ? <p className="alert alert-info">Cargando disponibilidad...</p> : null}
        {error ? <p className="alert alert-error">{error}</p> : null}

        {!isLoading && !error ? (
          availableDays.length > 0 ? (
            <div className="schedule-grid">
              <section className="panel">
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

              <section className="panel panel-elevated">
                <h3 style={{ marginTop: 0, color: '#123047' }}>
                  Horarios del día seleccionado
                </h3>
                <p className="page-subtitle" style={{ marginTop: 0 }}>
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
                        setLastReservation(null)
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
                  <section className="panel" style={{ marginTop: '24px' }}>
                    <h4 style={{ marginTop: 0, color: '#123047' }}>Reservar atención remota</h4>

                    <label className="form-label">
                      Motivo
                      <input
                        type="text"
                        value={motivo}
                        onChange={(event) => setMotivo(event.target.value)}
                        placeholder="Ej: control de seguimiento"
                        className="field"
                      />
                    </label>

                    <label className="form-label" style={{ marginTop: '12px' }}>
                      Observaciones
                      <textarea
                        value={observaciones}
                        onChange={(event) => setObservaciones(event.target.value)}
                        placeholder="Información adicional para la consulta"
                        rows={3}
                        className="field"
                      />
                    </label>

                    {submitError ? (
                      <p className="alert alert-error" style={{ marginTop: '16px' }}>
                        {submitError}
                      </p>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleReservar}
                      disabled={isSubmitting}
                      className="btn btn-success"
                      style={{ marginTop: '16px' }}
                    >
                      {isSubmitting ? 'Reservando...' : 'Reservar telemedicina'}
                    </button>

                    {lastReservation && !lastReservation.linkTelemedicina ? (
                      <p className="alert alert-info" style={{ marginTop: '16px' }}>
                        La reserva fue creada, pero el link de videollamada todavía no
                        está disponible.
                      </p>
                    ) : null}
                  </section>
                ) : null}
              </section>
            </div>
          ) : (
            <section className="empty-state">
              <h3 style={{ marginTop: 0, color: '#123047' }}>
                Sin horarios próximos disponibles
              </h3>
              <p style={{ margin: 0, color: '#4f677a' }}>
                Este médico no tiene horas remotas visibles en los próximos días.
                Puedes volver y revisar otra opción.
              </p>
            </section>
          )
        ) : null}
      </section>
    </DashboardLayout>
  )
}

import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
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
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
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

function getBlockStatusClass(status: BloqueDisponible['estado']) {
  if (status === 'DISPONIBLE') return 'status-badge-success'
  if (status === 'RESERVADO') return 'status-badge-warning'
  return 'status-badge-danger'
}

export function AgendaPage() {
  const { role } = useAuth()
  const isRecepcion = role === 'RECEPCION'
  const isAdmin = role === 'ADMIN'
  const isInstitutionalView = isRecepcion || isAdmin
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
  const [confirmation, setConfirmation] = useState<ReservationConfirmation | null>(null)

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
            const data = await agendaService.obtenerPorMedicoYFecha(Number(medicoId), fecha)
            return { fecha, bloques: data.bloques }
          }),
        )

        const nextAvailableDays = results
          .filter((result): result is PromiseFulfilledResult<AvailableDay> => result.status === 'fulfilled')
          .map((result) => result.value)
          .filter((day) => day.bloques.length > 0)

        setAvailableDays(nextAvailableDays)

        if (nextAvailableDays[0]) {
          setFechaSeleccionada(nextAvailableDays[0].fecha)
          setBloques(nextAvailableDays[0].bloques)
        }
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'No se pudo cargar la agenda'
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

    const currentDay = availableDays.find((day) => day.fecha === fechaSeleccionada) ?? availableDays[0]
    if (!currentDay) return
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
      await reservasService.crear({ bloqueHorarioId: selectedBloqueId, motivo: motivo.trim() })

      if (selectedBloque) {
        setConfirmation({ fecha: fechaSeleccionada, inicio: selectedBloque.inicio, fin: selectedBloque.fin })
      }

      const refreshed = await agendaService.obtenerPorMedicoYFecha(Number(medicoId), fechaSeleccionada)
      setAvailableDays((current) =>
        current
          .map((day) => (day.fecha === fechaSeleccionada ? { ...day, bloques: refreshed.bloques } : day))
          .filter((day) => day.bloques.length > 0),
      )

      setMotivo('')
      setSelectedBloqueId(null)
    } catch (reservationError) {
      const message = reservationError instanceof Error ? reservationError.message : 'No se pudo crear la reserva'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalBloques = bloques.length
  const bloquesDisponibles = bloques.filter((bloque) => bloque.estado === 'DISPONIBLE').length
  const bloquesNoDisponibles = totalBloques - bloquesDisponibles

  return (
    <DashboardLayout>
      <section className="page">
        <header className="page-header">
          <h2 className="page-title">{isRecepcion ? 'Gestión de agenda operativa' : isAdmin ? 'Visualización institucional de agenda' : 'Agenda disponible'}</h2>
          <p className="page-subtitle">Especialidad: <strong>{especialidadNombre || 'Sin especialidad'}</strong></p>
          <p className="page-subtitle">Médico: <strong>{medicoNombre || 'Sin médico seleccionado'}</strong></p>
        </header>

        {isRecepcion ? (
          <section className="panel">
            <strong className="data-row-title">Vista operativa para recepción</strong>
            <p className="page-subtitle">Aquí puedes revisar disponibilidad y bloques horarios del profesional. Esta pantalla no corresponde al flujo personal de reserva del paciente.</p>
          </section>
        ) : isAdmin ? (
          <section className="panel">
            <strong className="data-row-title">Vista institucional para administración</strong>
            <p className="page-subtitle">Permite supervisar disponibilidad y bloques horarios del profesional desde una perspectiva del sistema, sin exponer acciones de reserva personal.</p>
          </section>
        ) : null}

        <div className="page-nav">
          <Link to="/dashboard" className="page-nav-link">Volver al inicio</Link>
          <Link to="/especialidades" className="page-nav-link">Volver a especialidades</Link>
          <Link to={`/medicos?especialidadId=${especialidadId}&especialidadNombre=${encodeURIComponent(especialidadNombre)}`} className="page-nav-link">Volver a médicos</Link>
        </div>

        {confirmation && !isInstitutionalView ? (
          <section className="confirmation-card">
            <h3 className="confirmation-title">Reserva confirmada</h3>
            <p className="confirmation-copy">Tu hora con <strong>{medicoNombre}</strong> quedó agendada para <strong>{formatDateLabel(confirmation.fecha)}</strong>, de <strong>{formatHour(confirmation.inicio)}</strong> a <strong>{formatHour(confirmation.fin)}</strong>.</p>
            <div className="inline-links">
              <Link to="/mis-reservas" className="inline-link">Ir a mis reservas</Link>
              <Link to="/dashboard" className="inline-link">Volver al inicio</Link>
            </div>
          </section>
        ) : null}

        {isLoading ? <p className="alert alert-info">Cargando disponibilidad...</p> : null}
        {error ? <p className="alert alert-error">{error}</p> : null}

        {!isLoading && !error ? (
          availableDays.length > 0 ? (
            <div className="schedule-grid">
              <section className="panel">
                <h3 className="panel-title">Días disponibles</h3>
                <div className="selection-list">
                  {availableDays.map((day) => (
                    <button key={day.fecha} type="button" onClick={() => handleSelectDay(day)} className={`selection-card ${fechaSeleccionada === day.fecha ? 'selection-card-active' : ''}`}>
                      <span className="selection-card-title">{formatDateLabel(day.fecha)}</span>
                      <span className="selection-card-copy">{day.bloques.length} horarios disponibles</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="panel panel-elevated">
                <h3 className="panel-title">{isInstitutionalView ? 'Bloques horarios del día seleccionado' : 'Horarios del día seleccionado'}</h3>
                <p className="page-subtitle">{fechaSeleccionada ? `Mostrando horarios para ${formatDateLabel(fechaSeleccionada)}.` : 'Selecciona un día para ver sus horarios.'}</p>

                {isInstitutionalView && fechaSeleccionada ? (
                  <section className="panel">
                    <strong className="data-row-title">Resumen del día</strong>
                    <p className="page-subtitle">{bloquesDisponibles} bloques disponibles y {bloquesNoDisponibles} no disponibles para {formatDateLabel(fechaSeleccionada)}.</p>
                  </section>
                ) : null}

                <div className="selection-list">
                  {bloques.map((bloque) => (
                    <button
                      key={bloque.id}
                      type="button"
                      onClick={isInstitutionalView ? undefined : () => {
                        setSelectedBloqueId(bloque.id)
                        setSubmitError('')
                        setConfirmation(null)
                      }}
                      className={`selection-card ${!isInstitutionalView && selectedBloqueId === bloque.id ? 'selection-card-active' : ''}`}
                    >
                      <span className="selection-card-title">{formatHour(bloque.inicio)} - {formatHour(bloque.fin)}</span>
                      <div className="selection-card-tags">
                        <span className={`status-badge ${getBlockStatusClass(bloque.estado)}`}>{bloque.estado}</span>
                        <span className="status-badge status-badge-neutral">PRESENCIAL</span>
                      </div>
                    </button>
                  ))}
                </div>

                {!isInstitutionalView && bloques.length > 0 ? (
                  <section className="panel">
                    <h4 className="panel-title">Reservar horario</h4>
                    <label className="form-label">
                      Motivo
                      <input type="text" value={motivo} onChange={(event) => setMotivo(event.target.value)} placeholder="Ej: control general" className="field" />
                    </label>
                    {submitError ? <p className="alert alert-error">{submitError}</p> : null}
                    <button type="button" onClick={handleReservar} disabled={isSubmitting} className="btn btn-success">
                      {isSubmitting ? 'Reservando...' : 'Reservar'}
                    </button>
                  </section>
                ) : null}
              </section>
            </div>
          ) : (
            <section className="empty-state">
              <h3 style={{ marginTop: 0, color: '#123047' }}>Sin horarios próximos disponibles</h3>
              <p style={{ margin: 0, color: '#4f677a' }}>Este médico no tiene horas visibles en los próximos días. Puedes volver a médicos y revisar otra opción.</p>
            </section>
          )
        ) : null}
      </section>
    </DashboardLayout>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { reservasService, type Reserva } from '../services/reservas.service'
import { canViewMisReservas } from '../utils/auth'
import { formatDateTime } from '../utils/format'

export function MisReservasPage() {
  const { role } = useAuth()
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [cancelingId, setCancelingId] = useState<number | null>(null)
  const showMisReservas = canViewMisReservas(role)

  useEffect(() => {
    if (!showMisReservas) {
      setIsLoading(false)
      return
    }

    const cargarReservas = async () => {
      try {
        const data = await reservasService.listarMis()
        setReservas(data)
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : 'No se pudieron cargar tus reservas'

        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void cargarReservas()
  }, [showMisReservas])

  const handleCancelar = async (reservaId: number) => {
    setCancelingId(reservaId)
    setError('')
    setSuccessMessage('')

    try {
      await reservasService.cancelar(reservaId)
      setReservas((current) => current.filter((reserva) => reserva.id !== reservaId))
      setSuccessMessage('Reserva cancelada correctamente')
    } catch (cancelError) {
      const message =
        cancelError instanceof Error
          ? cancelError.message
          : 'No se pudo cancelar la reserva'

      setError(message)
    } finally {
      setCancelingId(null)
    }
  }

  return (
    <DashboardLayout>
      <section className="page">
        <header className="page-header">
          <h2 className="page-title">Mis reservas</h2>
          <p className="page-subtitle">
            {showMisReservas
              ? 'Aquí puedes revisar tus reservas activas y cancelarlas si es necesario.'
              : 'Esta vista no aplica para tu perfil actual.'}
          </p>
        </header>

        <div className="page-nav">
          <Link to="/dashboard" className="page-nav-link">
            Volver al inicio
          </Link>
        </div>

        {!showMisReservas ? (
          <section className="empty-state">
            <p style={{ margin: 0 }}>
              Si necesitas revisar el flujo completo, puedes volver al inicio y
              continuar desde especialidades.
            </p>
          </section>
        ) : null}

        {showMisReservas && isLoading ? (
          <p className="alert alert-info">Cargando reservas...</p>
        ) : null}
        {showMisReservas && successMessage ? (
          <p className="alert alert-success">{successMessage}</p>
        ) : null}
        {showMisReservas && error ? <p className="alert alert-error">{error}</p> : null}

        {showMisReservas && !isLoading && !error ? (
          reservas.length > 0 ? (
            <div className="data-list">
              {reservas.map((reserva) => (
                <article key={reserva.id} className="data-row">
                  <strong className="data-row-title">{reserva.medico.nombreCompleto}</strong>
                  <p className="data-row-meta">Fecha: {formatDateTime(reserva.bloqueHorario.inicio)}</p>
                  <p className="data-row-meta">
                    Modalidad:{' '}
                    {reserva.modalidad === 'TELEMEDICINA' ? 'Telemedicina' : 'Presencial'}
                  </p>
                  <p className="data-row-meta">Estado: {reserva.estado}</p>
                  <p className="data-row-meta">Motivo: {reserva.motivo || 'Sin motivo'}</p>

                  {reserva.modalidad === 'TELEMEDICINA' ? (
                    reserva.linkTelemedicina ? (
                      <section className="reservation-callout reservation-callout-ready">
                        <p className="reservation-callout-title">Videollamada disponible</p>
                        <p className="reservation-callout-copy">
                          Tu sala ya está lista para ingresar cuando corresponda.
                        </p>
                        <div className="data-row-actions">
                          <a
                            href={reserva.linkTelemedicina}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary"
                          >
                            Entrar a videollamada
                          </a>
                        </div>
                      </section>
                    ) : (
                      <section className="reservation-callout reservation-callout-pending">
                        <p className="reservation-callout-title">Videollamada pendiente</p>
                        <p className="reservation-callout-copy">
                          El link de sala aún no está disponible para esta teleconsulta.
                        </p>
                      </section>
                    )
                  ) : null}

                  {reserva.estado !== 'CANCELADA' ? (
                    <div className="data-row-actions">
                      <button
                        type="button"
                        onClick={() => handleCancelar(reserva.id)}
                        disabled={cancelingId === reserva.id}
                        className="btn btn-danger"
                      >
                        {cancelingId === reserva.id ? 'Cancelando...' : 'Cancelar reserva'}
                      </button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <section className="empty-state">
              <p style={{ margin: 0 }}>
                Aún no tienes reservas activas. Puedes volver al inicio y crear una
                nueva reserva cuando quieras.
              </p>
            </section>
          )
        ) : null}
      </section>
    </DashboardLayout>
  )
}

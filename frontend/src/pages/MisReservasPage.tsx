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
      <section>
        <h2 style={{ marginTop: 0, color: '#123047' }}>Mis reservas</h2>
        <p style={{ color: '#4f677a' }}>
          {showMisReservas
            ? 'Aquí puedes revisar tus reservas activas y cancelarlas si es necesario.'
            : 'Esta vista no aplica para tu perfil actual.'}
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '16px 0 24px' }}>
          <Link to="/dashboard" style={{ color: '#16a34a' }}>
            Volver al dashboard
          </Link>
        </div>

        {!showMisReservas ? (
          <section
            style={{
              padding: '20px',
              borderRadius: '16px',
              backgroundColor: '#f8fafc',
              border: '1px solid #d9e6f2',
            }}
          >
            <p style={{ margin: 0, color: '#4f677a' }}>
              Si necesitas revisar el flujo completo, puedes volver al dashboard y
              continuar desde especialidades.
            </p>
          </section>
        ) : null}

        {showMisReservas && isLoading ? <p>Cargando reservas...</p> : null}
        {showMisReservas && successMessage ? (
          <p style={{ color: '#15803d' }}>{successMessage}</p>
        ) : null}
        {showMisReservas && error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}

        {showMisReservas && !isLoading && !error ? (
          reservas.length > 0 ? (
            <div style={{ display: 'grid', gap: '14px', marginTop: '24px' }}>
              {reservas.map((reserva) => (
                <article
                  key={reserva.id}
                  style={{
                    border: '1px solid #d9e6f2',
                    borderRadius: '16px',
                    padding: '18px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <strong style={{ display: 'block', color: '#123047' }}>
                    {reserva.medico.nombreCompleto}
                  </strong>
                  <p style={{ margin: '8px 0', color: '#4f677a' }}>
                    Fecha: {formatDateTime(reserva.bloqueHorario.inicio)}
                  </p>
                  <p style={{ margin: '8px 0', color: '#4f677a' }}>
                    Estado: {reserva.estado}
                  </p>
                  <p style={{ margin: '8px 0 16px', color: '#4f677a' }}>
                    Motivo: {reserva.motivo || 'Sin motivo'}
                  </p>

                  {reserva.estado !== 'CANCELADA' ? (
                    <button
                      type="button"
                      onClick={() => handleCancelar(reserva.id)}
                      disabled={cancelingId === reserva.id}
                      style={{
                        border: 0,
                        borderRadius: '12px',
                        padding: '10px 16px',
                        backgroundColor: '#b91c1c',
                        color: '#ffffff',
                        cursor: cancelingId === reserva.id ? 'wait' : 'pointer',
                      }}
                    >
                      {cancelingId === reserva.id ? 'Cancelando...' : 'Cancelar reserva'}
                    </button>
                  ) : null}
                </article>
              ))}
            </div>
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
                Aún no tienes reservas activas. Puedes volver al dashboard y crear
                una nueva reserva cuando quieras.
              </p>
            </section>
          )
        ) : null}
      </section>
    </DashboardLayout>
  )
}

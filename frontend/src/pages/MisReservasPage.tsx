import { useEffect, useState } from 'react'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { reservasService, type Reserva } from '../services/reservas.service'

function formatDate(value: string) {
  return new Date(value).toLocaleString('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function MisReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [cancelingId, setCancelingId] = useState<number | null>(null)

  useEffect(() => {
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
  }, [])

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
          Aquí puedes revisar tus reservas activas y cancelarlas si es necesario.
        </p>

        {isLoading ? <p>Cargando reservas...</p> : null}
        {successMessage ? <p style={{ color: '#15803d' }}>{successMessage}</p> : null}
        {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}

        {!isLoading && !error ? (
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
                    Fecha: {formatDate(reserva.bloqueHorario.inicio)}
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
            <p style={{ marginTop: '24px' }}>No tienes reservas activas.</p>
          )
        ) : null}
      </section>
    </DashboardLayout>
  )
}

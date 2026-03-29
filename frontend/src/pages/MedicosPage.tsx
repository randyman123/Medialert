import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { medicosService, type Medico } from '../services/medicos.service'

export function MedicosPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const especialidadId = searchParams.get('especialidadId')
  const especialidadNombre = searchParams.get('especialidadNombre') ?? ''
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!especialidadId) {
      setError('Debes seleccionar una especialidad primero')
      setIsLoading(false)
      return
    }

    const cargarMedicos = async () => {
      try {
        const data = await medicosService.listarPorEspecialidad(Number(especialidadId))
        setMedicos(data.datos)
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : 'No se pudieron cargar los médicos'

        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void cargarMedicos()
  }, [especialidadId])

  const handleSelect = (medico: Medico) => {
    const params = new URLSearchParams({
      medicoId: String(medico.id),
      medicoNombre: medico.nombreCompleto,
      especialidadId: especialidadId ?? '',
      especialidadNombre,
    })

    navigate(`/agenda?${params.toString()}`)
  }

  return (
    <DashboardLayout>
      <section>
        <h2 style={{ marginTop: 0, color: '#123047' }}>Médicos</h2>
        <p style={{ color: '#4f677a' }}>
          Especialidad seleccionada:{' '}
          <strong>{especialidadNombre || 'Sin especialidad'}</strong>
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
            Volver al dashboard
          </Link>
          <Link to="/especialidades" style={{ color: '#16a34a' }}>
            Volver a especialidades
          </Link>
        </div>

        {isLoading ? <p>Cargando médicos...</p> : null}
        {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}

        {!isLoading && !error ? (
          medicos.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {medicos.map((medico) => (
                <button
                  key={medico.id}
                  type="button"
                  onClick={() => handleSelect(medico)}
                  style={{
                    textAlign: 'left',
                    border: '1px solid #d9e6f2',
                    backgroundColor: '#ffffff',
                    borderRadius: '14px',
                    padding: '16px',
                    cursor: 'pointer',
                  }}
                >
                  <strong style={{ display: 'block', color: '#123047' }}>
                    {medico.nombreCompleto}
                  </strong>
                  <span style={{ color: '#4f677a' }}>
                    {medico.especialidades.map((item) => item.nombre).join(', ')}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p style={{ color: '#4f677a' }}>
              No encontramos médicos para esta especialidad por ahora.
            </p>
          )
        ) : null}
      </section>
    </DashboardLayout>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../layouts/DashboardLayout'
import {
  especialidadesService,
  type Especialidad,
} from '../services/especialidades.service'

export function EspecialidadesPage() {
  const navigate = useNavigate()
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarEspecialidades = async () => {
      try {
        const data = await especialidadesService.listar()
        setEspecialidades(data)
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : 'No se pudieron cargar las especialidades'

        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void cargarEspecialidades()
  }, [])

  const handleSelect = (especialidad: Especialidad) => {
    const params = new URLSearchParams({
      especialidadId: String(especialidad.id),
      especialidadNombre: especialidad.nombre,
    })

    navigate(`/medicos?${params.toString()}`)
  }

  return (
    <DashboardLayout>
      <section>
        <h2 style={{ marginTop: 0, color: '#123047' }}>Especialidades</h2>
        <p style={{ color: '#4f677a' }}>
          Selecciona una especialidad para ver los médicos disponibles.
        </p>

        {isLoading ? <p>Cargando especialidades...</p> : null}
        {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}

        {!isLoading && !error ? (
          <div style={{ display: 'grid', gap: '12px', marginTop: '24px' }}>
            {especialidades.map((especialidad) => (
              <button
                key={especialidad.id}
                type="button"
                onClick={() => handleSelect(especialidad)}
                style={{
                  textAlign: 'left',
                  border: '1px solid #d9e6f2',
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  padding: '16px',
                  cursor: 'pointer',
                }}
              >
                {especialidad.nombre}
              </button>
            ))}
          </div>
        ) : null}
      </section>
    </DashboardLayout>
  )
}

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../layouts/DashboardLayout'
import type { Especialidad } from '../services/especialidades.service'
import { telemedicinaService } from '../services/telemedicina.service'

export function TelemedicinaPage() {
  const navigate = useNavigate()
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarEspecialidades = async () => {
      try {
        const data = await telemedicinaService.listarEspecialidades()
        setEspecialidades(data)
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'No se pudieron cargar las especialidades de telemedicina',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void cargarEspecialidades()
  }, [])

  const handleSelect = (especialidad: Especialidad) => {
    navigate(
      `/telemedicina/medicos/${especialidad.id}?especialidadNombre=${encodeURIComponent(especialidad.nombre)}`,
    )
  }

  return (
    <DashboardLayout>
      <section className="page">
        <header className="page-header">
          <h2 className="page-title">Telemedicina</h2>
          <p className="page-subtitle">
            Selecciona una especialidad para reservar una atención remota.
          </p>
        </header>

        <div className="page-nav">
          <Link to="/dashboard" className="page-nav-link">
            Volver al inicio
          </Link>
        </div>

        {isLoading ? <p className="alert alert-info">Cargando especialidades...</p> : null}
        {error ? <p className="alert alert-error">{error}</p> : null}

        {!isLoading && !error ? (
          especialidades.length > 0 ? (
            <div className="data-list">
              {especialidades.map((especialidad) => (
                <button
                  key={especialidad.id}
                  type="button"
                  onClick={() => handleSelect(especialidad)}
                  className="action-card"
                >
                  <strong style={{ color: '#123047' }}>{especialidad.nombre}</strong>
                  <p style={{ margin: '8px 0 0', color: '#4f677a' }}>
                    Ver médicos y horarios disponibles para videoconsulta.
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <section className="empty-state">
              <p style={{ margin: 0 }}>
                Todavía no hay especialidades con telemedicina disponible.
              </p>
            </section>
          )
        ) : null}
      </section>
    </DashboardLayout>
  )
}

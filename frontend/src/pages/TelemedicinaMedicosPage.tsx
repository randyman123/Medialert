import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { DashboardLayout } from '../layouts/DashboardLayout'
import type { Medico } from '../services/medicos.service'
import { telemedicinaService } from '../services/telemedicina.service'

export function TelemedicinaMedicosPage() {
  const navigate = useNavigate()
  const { especialidadId } = useParams()
  const [searchParams] = useSearchParams()
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
        const data = await telemedicinaService.listarMedicos(Number(especialidadId))
        setMedicos(data.medicos)
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : 'No se pudieron cargar los médicos de telemedicina',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void cargarMedicos()
  }, [especialidadId])

  const handleSelect = (medico: Medico) => {
    navigate(`/telemedicina/agenda/${medico.id}?especialidadId=${especialidadId ?? ''}&especialidadNombre=${encodeURIComponent(especialidadNombre)}&medicoNombre=${encodeURIComponent(medico.nombreCompleto)}`)
  }

  return (
    <DashboardLayout>
      <section className="page">
        <header className="page-header">
          <h2 className="page-title">Médicos para telemedicina</h2>
          <p className="page-subtitle">Especialidad seleccionada: <strong>{especialidadNombre || 'Sin especialidad'}</strong></p>
        </header>

        <div className="page-nav">
          <Link to="/dashboard" className="page-nav-link">Volver al inicio</Link>
          <Link to="/telemedicina" className="page-nav-link">Volver a telemedicina</Link>
        </div>

        {isLoading ? <p className="alert alert-info">Cargando médicos...</p> : null}
        {error ? <p className="alert alert-error">{error}</p> : null}

        {!isLoading && !error ? (
          medicos.length > 0 ? (
            <div className="data-list">
              {medicos.map((medico) => (
                <button key={medico.id} type="button" onClick={() => handleSelect(medico)} className="action-card">
                  <div>
                    <h3 className="action-card-title">{medico.nombreCompleto}</h3>
                    <p className="action-card-description">{medico.especialidades.map((item) => item.nombre).join(', ')}</p>
                  </div>
                  <span className="action-card-label">Ver horarios remotos</span>
                </button>
              ))}
            </div>
          ) : (
            <section className="empty-state">
              <p style={{ margin: 0 }}>No encontramos médicos con agenda remota para esta especialidad.</p>
            </section>
          )
        ) : null}
      </section>
    </DashboardLayout>
  )
}

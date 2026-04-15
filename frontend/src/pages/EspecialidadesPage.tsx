import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { DashboardLayout } from '../layouts/DashboardLayout'
import {
  especialidadesService,
  type Especialidad,
} from '../services/especialidades.service'

export function EspecialidadesPage() {
  const navigate = useNavigate()
  const { role } = useAuth()
  const isRecepcion = role === 'RECEPCION'
  const isAdmin = role === 'ADMIN'
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
      <section className="page">
        <header className="page-header">
          <h2 className="page-title">
            {isRecepcion
              ? 'Gestión de agenda'
              : isAdmin
                ? 'Gestión médica institucional'
                : 'Especialidades'}
          </h2>
          <p className="page-subtitle">
            {isRecepcion
              ? 'Selecciona una especialidad para revisar los médicos asociados y su disponibilidad operativa.'
              : isAdmin
                ? 'Listado de especialidades disponibles en el sistema.'
                : 'Selecciona una especialidad para ver los médicos disponibles.'}
          </p>
        </header>

        {isRecepcion ? (
          <section className="panel" style={{ marginBottom: '20px' }}>
            <strong style={{ display: 'block', color: '#123047' }}>
              Vista operativa de recepción
            </strong>
            <p className="page-subtitle" style={{ marginBottom: 0 }}>
              Este módulo permite navegar la agenda clínica por especialidad y médico
              para consultar bloques horarios disponibles.
            </p>
          </section>
        ) : isAdmin ? (
          <section className="panel" style={{ marginBottom: '20px' }}>
            <strong style={{ display: 'block', color: '#123047' }}>
              Vista institucional para administración del sistema
            </strong>
            <p className="page-subtitle" style={{ marginBottom: 0 }}>
              Permite visualizar la estructura médica registrada y supervisar las
              especialidades disponibles. Las funciones de edición se integrarán
              próximamente.
            </p>
          </section>
        ) : null}

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
                  {especialidad.nombre}
                </button>
              ))}
            </div>
          ) : (
            <section className="empty-state">
              <p style={{ margin: 0 }}>Todavía no hay especialidades para mostrar.</p>
            </section>
          )
        ) : null}
      </section>
    </DashboardLayout>
  )
}

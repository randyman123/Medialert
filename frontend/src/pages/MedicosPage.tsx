import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { medicosService, type Medico } from '../services/medicos.service'

export function MedicosPage() {
  const navigate = useNavigate()
  const { role } = useAuth()
  const isRecepcion = role === 'RECEPCION'
  const isAdmin = role === 'ADMIN'
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
      <section className="page">
        <header className="page-header">
          <h2 className="page-title">
            {isRecepcion
              ? 'Médicos por especialidad'
              : isAdmin
                ? 'Profesionales por especialidad'
                : 'Médicos'}
          </h2>
          <p className="page-subtitle">
            {isRecepcion
              ? 'Revisa el equipo médico asociado a '
              : isAdmin
                ? 'Visualización institucional de médicos registrados en '
                : 'Especialidad seleccionada: '}
            <strong>{especialidadNombre || 'Sin especialidad'}</strong>
          </p>
        </header>

        {isRecepcion ? (
          <section className="panel" style={{ marginBottom: '20px' }}>
            <strong style={{ display: 'block', color: '#123047' }}>
              Paso 2 de la gestión operativa
            </strong>
            <p className="page-subtitle" style={{ marginBottom: 0 }}>
              Selecciona un médico para ver sus bloques horarios disponibles y apoyar
              la coordinación desde recepción.
            </p>
          </section>
        ) : isAdmin ? (
          <section className="panel" style={{ marginBottom: '20px' }}>
            <strong style={{ display: 'block', color: '#123047' }}>
              Contexto institucional
            </strong>
            <p className="page-subtitle" style={{ marginBottom: 0 }}>
              Esta vista permite revisar los profesionales registrados por
              especialidad y navegar la estructura médica del sistema. Las funciones
              de edición se integrarán próximamente.
            </p>
          </section>
        ) : null}

        <div className="page-nav">
          <Link to="/dashboard" className="page-nav-link">
            Volver al inicio
          </Link>
          <Link to="/especialidades" className="page-nav-link">
            Volver a especialidades
          </Link>
        </div>

        {isLoading ? <p className="alert alert-info">Cargando médicos...</p> : null}
        {error ? <p className="alert alert-error">{error}</p> : null}

        {!isLoading && !error ? (
          medicos.length > 0 ? (
            <div className="data-list">
              {medicos.map((medico) => (
                <button
                  key={medico.id}
                  type="button"
                  onClick={() => handleSelect(medico)}
                  className="action-card"
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
            <section className="empty-state">
              <p style={{ margin: 0 }}>
                No encontramos médicos para esta especialidad por ahora.
              </p>
            </section>
          )
        ) : null}
      </section>
    </DashboardLayout>
  )
}

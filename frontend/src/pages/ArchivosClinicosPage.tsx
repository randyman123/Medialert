import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { DashboardLayout } from '../layouts/DashboardLayout'
import {
  misArchivosService,
  type ArchivoPaciente,
} from '../services/mis-archivos.service'
import { formatDateTime, formatFileSize } from '../utils/format'

function canUseClinicalFiles(role: string | null) {
  return role === 'ADMIN' || role === 'RECEPCION'
}

export function ArchivosClinicosPage() {
  const { role } = useAuth()
  const canAccess = canUseClinicalFiles(role)
  const [pacienteId, setPacienteId] = useState('')
  const [searchedPacienteId, setSearchedPacienteId] = useState<number | null>(null)
  const [archivos, setArchivos] = useState<ArchivoPaciente[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSearch = async () => {
    const parsedPacienteId = Number(pacienteId)

    if (!parsedPacienteId || parsedPacienteId <= 0) {
      setError('Debes ingresar un pacienteId válido')
      setSuccessMessage('')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const data = await misArchivosService.listarPorPaciente(parsedPacienteId)
      setArchivos(data)
      setSearchedPacienteId(parsedPacienteId)
      setSuccessMessage(
        data.length > 0
          ? 'Archivos clínicos cargados correctamente'
          : 'No se encontraron archivos para ese paciente',
      )
    } catch (loadError) {
      setArchivos([])
      setSearchedPacienteId(parsedPacienteId)
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'No se pudieron cargar los archivos clínicos',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (id: number) => {
    setDownloadingId(id)
    setError('')
    setSuccessMessage('')

    try {
      await misArchivosService.descargar(id)
      setSuccessMessage('Descarga iniciada correctamente')
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : 'No se pudo descargar el archivo',
      )
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <DashboardLayout>
      <section className="page">
        <header className="page-header">
          <h2 className="page-title">Archivos clínicos</h2>
          <p className="page-subtitle">
            Consulta documentación clínica por pacienteId desde una vista institucional.
          </p>
        </header>

        <div className="page-nav">
          <Link to="/dashboard" className="page-nav-link">
            Volver al inicio
          </Link>
        </div>

        {!canAccess ? (
          <section className="empty-state">
            <p style={{ margin: 0 }}>
              Esta vista institucional está disponible solo para ADMIN y RECEPCION.
            </p>
          </section>
        ) : (
          <>
            <section className="panel stack-md">
              <h3 className="panel-title">Buscar archivos por paciente</h3>

              <div className="form-row">
                <label className="form-label">
                  Paciente ID
                  <input
                    type="number"
                    min={1}
                    value={pacienteId}
                    onChange={(event) => setPacienteId(event.target.value)}
                    placeholder="Ej: 2"
                    className="field"
                  />
                </label>
              </div>

              <div className="data-row-actions">
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? 'Buscando...' : 'Buscar archivos'}
                </button>
              </div>
            </section>

            {isLoading ? (
              <p className="alert alert-info">Cargando archivos clínicos...</p>
            ) : null}
            {successMessage ? <p className="alert alert-success">{successMessage}</p> : null}
            {error ? <p className="alert alert-error">{error}</p> : null}

            {!isLoading && searchedPacienteId !== null && !error ? (
              archivos.length > 0 ? (
                <div className="data-list">
                  {archivos.map((item) => (
                    <article key={item.id} className="data-row">
                      <strong className="data-row-title">{item.nombreOriginal}</strong>
                      <p className="data-row-meta">Paciente ID: {item.pacienteId}</p>
                      <p className="data-row-meta">Categoría: {item.categoria}</p>
                      <p className="data-row-meta">
                        Fecha de subida: {formatDateTime(item.fechaSubida)}
                      </p>
                      <p className="data-row-meta">Tamaño: {formatFileSize(item.tamano)}</p>

                      <div className="data-row-actions">
                        <button
                          type="button"
                          onClick={() => handleDownload(item.id)}
                          disabled={downloadingId === item.id}
                          className="btn btn-primary"
                        >
                          {downloadingId === item.id ? 'Descargando...' : 'Descargar'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <section className="empty-state">
                  <p style={{ margin: 0 }}>
                    No hay archivos clínicos para el paciente ID <strong>{searchedPacienteId}</strong>.
                  </p>
                </section>
              )
            ) : null}
          </>
        )}
      </section>
    </DashboardLayout>
  )
}

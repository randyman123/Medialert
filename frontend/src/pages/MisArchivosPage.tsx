import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { DashboardLayout } from '../layouts/DashboardLayout'
import {
  misArchivosService,
  type ArchivoPaciente,
  type CategoriaArchivo,
} from '../services/mis-archivos.service'
import { canManagePatientContent } from '../utils/auth'
import { formatDateTime, formatFileSize } from '../utils/format'

const categorias: CategoriaArchivo[] = ['EXAMEN', 'RECETA', 'ORDEN', 'INFORME', 'OTRO']

export function MisArchivosPage() {
  const { role } = useAuth()
  const canUsePatientModules = canManagePatientContent(role)
  const [archivos, setArchivos] = useState<ArchivoPaciente[]>([])
  const [categoria, setCategoria] = useState<CategoriaArchivo>('EXAMEN')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (!canUsePatientModules) {
      setIsLoading(false)
      return
    }

    const cargarArchivos = async () => {
      try {
        const data = await misArchivosService.listarMis()
        setArchivos(data)
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'No se pudieron cargar tus archivos',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void cargarArchivos()
  }, [canUsePatientModules])

  const handleUpload = async () => {
    if (!archivo) {
      setError('Debes seleccionar un archivo para subir')
      return
    }

    setIsUploading(true)
    setError('')
    setSuccessMessage('')

    try {
      const nuevoArchivo = await misArchivosService.subir(categoria, archivo)
      setArchivos((current) => [nuevoArchivo, ...current])
      setArchivo(null)
      setSuccessMessage('Archivo subido correctamente')
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : 'No se pudo subir el archivo',
      )
    } finally {
      setIsUploading(false)
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

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('¿Quieres eliminar este archivo?')

    if (!confirmed) {
      return
    }

    setDeletingId(id)
    setError('')
    setSuccessMessage('')

    try {
      await misArchivosService.eliminar(id)
      setArchivos((current) => current.filter((archivoActual) => archivoActual.id !== id))
      setSuccessMessage('Archivo eliminado correctamente')
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar el archivo',
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <DashboardLayout>
      <section className="page">
        <header className="page-header">
          <h2 className="page-title">Mis archivos</h2>
          <p className="page-subtitle">
            Sube, descarga y organiza tus documentos clínicos personales.
          </p>
        </header>

        <div className="page-nav">
          <Link to="/dashboard" className="page-nav-link">
            Volver al inicio
          </Link>
        </div>

        {!canUsePatientModules ? (
          <section className="empty-state">
            <p style={{ margin: 0 }}>
              Esta sección está disponible solo para pacientes autenticados.
            </p>
          </section>
        ) : null}

        {canUsePatientModules ? (
          <section className="panel stack-md">
            <h3 className="panel-title">Subir nuevo archivo</h3>

            <div className="form-row">
              <label className="form-label">
                Categoría
                <select
                  value={categoria}
                  onChange={(event) => setCategoria(event.target.value as CategoriaArchivo)}
                  className="field"
                >
                  {categorias.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-label">
                Archivo
                <input
                  type="file"
                  onChange={(event) => setArchivo(event.target.files?.[0] ?? null)}
                  className="field"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className="btn btn-success"
              style={{ width: 'fit-content' }}
            >
              {isUploading ? 'Subiendo...' : 'Subir archivo'}
            </button>
          </section>
        ) : null}

        {isLoading ? <p className="alert alert-info">Cargando archivos...</p> : null}
        {successMessage ? <p className="alert alert-success">{successMessage}</p> : null}
        {error ? <p className="alert alert-error">{error}</p> : null}

        {canUsePatientModules && !isLoading && !error ? (
          archivos.length > 0 ? (
            <div className="data-list">
              {archivos.map((item) => (
                <article key={item.id} className="data-row">
                  <strong className="data-row-title">{item.nombreOriginal}</strong>
                  <p className="data-row-meta">Categoría: {item.categoria}</p>
                  <p className="data-row-meta">Fecha de subida: {formatDateTime(item.fechaSubida)}</p>
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

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="btn btn-danger"
                    >
                      {deletingId === item.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <section className="empty-state">
              <p style={{ margin: 0 }}>
                Aún no has subido archivos. Puedes comenzar cargando exámenes,
                recetas u otros documentos importantes.
              </p>
            </section>
          )
        ) : null}
      </section>
    </DashboardLayout>
  )
}

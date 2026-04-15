import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { DashboardLayout } from '../layouts/DashboardLayout'
import {
  pastilleroService,
  type MedicamentoPaciente,
  type MedicamentoPayload,
} from '../services/pastillero.service'
import { canManagePatientContent } from '../utils/auth'
import { formatDate, formatDateTime } from '../utils/format'

type ReminderMode = 'exact' | 'before'

function getToday() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`
}

function getCurrentHour() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function getInitialFormState(): MedicamentoPayload {
  return {
    nombreMedicamento: '',
    dosis: '',
    horaInicio: getCurrentHour(),
    fechaInicio: getToday(),
    frecuenciaHoras: 8,
    duracionDias: 7,
    alarmaActiva: true,
    recordarMinutosAntes: 0,
    whatsappRecordatorioActivo: false,
    observaciones: '',
  }
}

function getReminderMode(minutesBefore?: number): ReminderMode {
  return (minutesBefore ?? 0) > 0 ? 'before' : 'exact'
}

function getReminderLabel(item: MedicamentoPaciente) {
  if (!item.alarmaActiva) {
    return 'Alarmas desactivadas'
  }

  const minutesBefore = item.recordarMinutosAntes ?? 0

  if (minutesBefore <= 0) {
    return 'Aviso a la hora exacta'
  }

  return `Aviso ${minutesBefore} min antes`
}

export function PastilleroPage() {
  const { role } = useAuth()
  const canUsePatientModules = canManagePatientContent(role)
  const [medicamentos, setMedicamentos] = useState<MedicamentoPaciente[]>([])
  const [form, setForm] = useState<MedicamentoPayload>(getInitialFormState)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const reminderMode = getReminderMode(form.recordarMinutosAntes)

  useEffect(() => {
    if (!canUsePatientModules) {
      setIsLoading(false)
      return
    }

    const cargarMedicamentos = async () => {
      try {
        const data = await pastilleroService.listarMis()
        setMedicamentos(data)
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'No se pudo cargar el pastillero',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void cargarMedicamentos()
  }, [canUsePatientModules])

  const resetForm = () => {
    setForm(getInitialFormState())
    setEditingId(null)
  }

  const handleChange = <K extends keyof MedicamentoPayload>(
    key: K,
    value: MedicamentoPayload[K],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handleSubmit = async () => {
    if (form.nombreMedicamento.trim().length < 2) {
      setError('Debes indicar el nombre del medicamento')
      return
    }

    setIsSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      const payload: MedicamentoPayload = {
        ...form,
        nombreMedicamento: form.nombreMedicamento.trim(),
        dosis: form.dosis?.trim() || undefined,
        observaciones: form.observaciones?.trim() || undefined,
        recordarMinutosAntes: form.alarmaActiva ? form.recordarMinutosAntes ?? 0 : 0,
        whatsappRecordatorioActivo: form.alarmaActiva
          ? Boolean(form.whatsappRecordatorioActivo)
          : false,
      }

      if (editingId) {
        const actualizado = await pastilleroService.actualizar(editingId, payload)
        setMedicamentos((current) =>
          current.map((item) => (item.id === editingId ? actualizado : item)),
        )
        setSuccessMessage('Medicamento actualizado correctamente')
      } else {
        const creado = await pastilleroService.crear(payload)
        setMedicamentos((current) => [creado, ...current])
        setSuccessMessage('Medicamento registrado correctamente')
      }

      resetForm()
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'No se pudo guardar el medicamento',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = async (id: number) => {
    setLoadingDetailId(id)
    setError('')
    setSuccessMessage('')

    try {
      const detalle = await pastilleroService.obtener(id)
      setEditingId(detalle.id)
      setForm({
        nombreMedicamento: detalle.nombreMedicamento,
        dosis: detalle.dosis ?? '',
        horaInicio: detalle.horaInicio,
        fechaInicio: detalle.fechaInicio,
        frecuenciaHoras: detalle.frecuenciaHoras,
        duracionDias: detalle.duracionDias,
        alarmaActiva: detalle.alarmaActiva,
        recordarMinutosAntes: detalle.recordarMinutosAntes ?? 0,
        whatsappRecordatorioActivo: detalle.whatsappRecordatorioActivo ?? false,
        observaciones: detalle.observaciones ?? '',
      })
    } catch (detailError) {
      setError(
        detailError instanceof Error
          ? detailError.message
          : 'No se pudo cargar el detalle del medicamento',
      )
    } finally {
      setLoadingDetailId(null)
    }
  }

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('¿Quieres desactivar este medicamento?')

    if (!confirmed) {
      return
    }

    setDeletingId(id)
    setError('')
    setSuccessMessage('')

    try {
      await pastilleroService.eliminar(id)
      setMedicamentos((current) => current.filter((item) => item.id !== id))

      if (editingId === id) {
        resetForm()
      }

      setSuccessMessage('Medicamento desactivado correctamente')
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'No se pudo desactivar el medicamento',
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <DashboardLayout>
      <section className="page">
        <header className="page-header">
          <h2 className="page-title">Pastillero</h2>
          <p className="page-subtitle">
            Registra tus medicamentos, revisa próximas dosis y mantén seguimiento de tu
            tratamiento.
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
            <h3 className="panel-title">
              {editingId ? 'Editar medicamento' : 'Registrar medicamento'}
            </h3>

            <label className="form-label">
              Nombre del medicamento
              <input
                type="text"
                value={form.nombreMedicamento}
                onChange={(event) => handleChange('nombreMedicamento', event.target.value)}
                className="field"
              />
            </label>

            <div className="form-row">
              <label className="form-label">
                Dosis
                <input
                  type="text"
                  value={form.dosis ?? ''}
                  onChange={(event) => handleChange('dosis', event.target.value)}
                  placeholder="Ej: 500mg"
                  className="field"
                />
              </label>

              <label className="form-label">
                Hora de inicio
                <input
                  type="time"
                  value={form.horaInicio}
                  onChange={(event) => handleChange('horaInicio', event.target.value)}
                  className="field"
                />
              </label>

              <label className="form-label">
                Fecha de inicio
                <input
                  type="date"
                  value={form.fechaInicio}
                  onChange={(event) => handleChange('fechaInicio', event.target.value)}
                  className="field"
                />
              </label>
            </div>

            <div className="form-row">
              <label className="form-label">
                Frecuencia en horas
                <input
                  type="number"
                  min={1}
                  value={form.frecuenciaHoras}
                  onChange={(event) =>
                    handleChange('frecuenciaHoras', Number(event.target.value) || 1)
                  }
                  className="field"
                />
              </label>

              <label className="form-label">
                Duración en días
                <input
                  type="number"
                  min={1}
                  value={form.duracionDias}
                  onChange={(event) =>
                    handleChange('duracionDias', Number(event.target.value) || 1)
                  }
                  className="field"
                />
              </label>
            </div>

            <section className="reminder-config">
              <div className="reminder-config-head">
                <div>
                  <h4 className="reminder-config-title">Recordatorios</h4>
                  <p className="reminder-config-copy">
                    Configura cuándo quieres recibir el aviso y deja preparado el canal
                    futuro de notificación.
                  </p>
                </div>
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={form.alarmaActiva}
                    onChange={(event) => {
                      const checked = event.target.checked
                      handleChange('alarmaActiva', checked)

                      if (!checked) {
                        handleChange('recordarMinutosAntes', 0)
                        handleChange('whatsappRecordatorioActivo', false)
                      }
                    }}
                  />
                  Alarma activa
                </label>
              </div>

              <div className="form-row">
                <label className="form-label">
                  Momento del aviso
                  <select
                    value={reminderMode}
                    onChange={(event) =>
                      handleChange(
                        'recordarMinutosAntes',
                        event.target.value === 'before'
                          ? Math.max(form.recordarMinutosAntes ?? 15, 5)
                          : 0,
                      )
                    }
                    disabled={!form.alarmaActiva}
                    className="field"
                  >
                    <option value="exact">A la hora exacta</option>
                    <option value="before">Unos minutos antes</option>
                  </select>
                </label>

                <label className="form-label">
                  Minutos antes
                  <input
                    type="number"
                    min={0}
                    step={5}
                    value={form.recordarMinutosAntes ?? 0}
                    onChange={(event) =>
                      handleChange(
                        'recordarMinutosAntes',
                        Math.max(0, Number(event.target.value) || 0),
                      )
                    }
                    disabled={!form.alarmaActiva || reminderMode === 'exact'}
                    className="field"
                  />
                </label>

                <label className="form-label">
                  Canal de notificación
                  <select
                    value={form.whatsappRecordatorioActivo ? 'whatsapp' : 'none'}
                    onChange={(event) =>
                      handleChange(
                        'whatsappRecordatorioActivo',
                        event.target.value === 'whatsapp',
                      )
                    }
                    disabled={!form.alarmaActiva}
                    className="field"
                  >
                    <option value="none">Solo alarma del tratamiento</option>
                    <option value="whatsapp">WhatsApp (preparado)</option>
                  </select>
                </label>
              </div>

              <p className="reminder-preview">
                {form.alarmaActiva
                  ? `Resumen: ${reminderMode === 'exact' ? 'aviso exacto' : `aviso ${form.recordarMinutosAntes ?? 0} minutos antes`} y ${form.whatsappRecordatorioActivo ? 'canal WhatsApp preparado' : 'sin canal externo activo'}.`
                  : 'Los recordatorios están apagados para este medicamento.'}
              </p>
            </section>

            <label className="form-label">
              Observaciones
              <textarea
                value={form.observaciones ?? ''}
                onChange={(event) => handleChange('observaciones', event.target.value)}
                rows={3}
                className="field"
              />
            </label>

            <div className="data-row-actions">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className="btn btn-success"
              >
                {isSaving
                  ? editingId
                    ? 'Guardando...'
                    : 'Registrando...'
                  : editingId
                    ? 'Guardar cambios'
                    : 'Registrar medicamento'}
              </button>

              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary"
                >
                  Cancelar edición
                </button>
              ) : null}
            </div>
          </section>
        ) : null}

        {isLoading ? <p className="alert alert-info">Cargando medicamentos...</p> : null}
        {successMessage ? <p className="alert alert-success">{successMessage}</p> : null}
        {error ? <p className="alert alert-error">{error}</p> : null}

        {canUsePatientModules && !isLoading && !error ? (
          medicamentos.length > 0 ? (
            <div className="data-list">
              {medicamentos.map((item) => (
                <article key={item.id} className="data-row">
                  <div className="data-row-top">
                    <strong className="data-row-title">{item.nombreMedicamento}</strong>
                    <div className="status-badges">
                      <span className={`status-badge ${item.activo ? 'status-badge-success' : 'status-badge-neutral'}`}>
                        {item.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      <span
                        className={`status-badge ${item.alarmaActiva ? 'status-badge-info' : 'status-badge-neutral'}`}
                      >
                        {item.alarmaActiva ? 'Alarma activa' : 'Alarma pausada'}
                      </span>
                      <span className="status-badge status-badge-neutral">
                        {item.whatsappRecordatorioActivo
                          ? 'WhatsApp preparado'
                          : 'Sin canal externo'}
                      </span>
                    </div>
                  </div>

                  <p className="data-row-meta">Dosis: {item.dosis || 'No especificada'}</p>
                  <p className="data-row-meta">
                    Inicio: {formatDate(item.fechaInicio)} a las {item.horaInicio}
                  </p>
                  <p className="data-row-meta">
                    Frecuencia: cada {item.frecuenciaHoras} horas durante {item.duracionDias}{' '}
                    días
                  </p>
                  <p className="data-row-meta">
                    Próxima dosis estimada:{' '}
                    {item.proximaDosisEstimada
                      ? formatDateTime(item.proximaDosisEstimada)
                      : 'Sin próximas dosis'}
                  </p>
                  <p className="data-row-meta">
                    Próximo recordatorio:{' '}
                    {item.proximoRecordatorioEstimado
                      ? formatDateTime(item.proximoRecordatorioEstimado)
                      : getReminderLabel(item)}
                  </p>
                  <p className="data-row-meta">
                    Fecha fin estimada: {formatDate(item.fechaFinEstimada)}
                  </p>
                  <p className="data-row-meta">Estado del recordatorio: {getReminderLabel(item)}</p>
                  <p className="data-row-meta">
                    Observaciones: {item.observaciones || 'Sin observaciones'}
                  </p>

                  <div className="data-row-actions">
                    <button
                      type="button"
                      onClick={() => handleEdit(item.id)}
                      disabled={loadingDetailId === item.id}
                      className="btn btn-primary"
                    >
                      {loadingDetailId === item.id ? 'Cargando...' : 'Editar'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="btn btn-danger"
                    >
                      {deletingId === item.id ? 'Desactivando...' : 'Desactivar'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <section className="empty-state">
              <p style={{ margin: 0 }}>
                Aún no tienes medicamentos activos. Puedes registrar el primero desde el
                formulario superior.
              </p>
            </section>
          )
        ) : null}
      </section>
    </DashboardLayout>
  )
}

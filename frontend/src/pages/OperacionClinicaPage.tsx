import { Link } from 'react-router-dom'
import { DashboardLayout } from '../layouts/DashboardLayout'

export function OperacionClinicaPage() {
  return (
    <DashboardLayout>
      <section className="page">
        <header className="page-header">
          <h2 className="page-title">Operación clínica</h2>
          <p className="page-subtitle">
            Vista institucional para recepción y coordinación clínica diaria.
          </p>
        </header>

        <div className="page-nav">
          <Link to="/dashboard" className="page-nav-link">
            Volver al inicio
          </Link>
        </div>

        <section className="stack-md">
          <div className="stack-md" style={{ gap: '4px' }}>
            <h3 className="section-heading">Accesos operativos</h3>
            <p className="section-caption">
              Usa estos accesos para navegar por la operación diaria sin entrar a módulos
              personales de paciente.
            </p>
          </div>

          <div className="cards-grid">
            <Link to="/especialidades" className="action-card action-card-primary">
              <div>
                <strong style={{ display: 'block', fontSize: '1.05rem' }}>
                  Gestión de agenda
                </strong>
                <p className="data-row-meta" style={{ marginTop: '8px' }}>
                  Revisa especialidades, médicos y disponibilidad como base para la
                  coordinación asistencial.
                </p>
              </div>
              <span className="action-card-label">Abrir</span>
            </Link>

            <Link to="/telemedicina" className="action-card">
              <div>
                <strong style={{ display: 'block', fontSize: '1.05rem' }}>
                  Atención remota institucional
                </strong>
                <p className="data-row-meta" style={{ marginTop: '8px' }}>
                  Accede al flujo de telemedicina desde una perspectiva operativa.
                </p>
              </div>
              <span className="action-card-label">Abrir</span>
            </Link>

            <button type="button" disabled className="action-card action-card-disabled">
              <div>
                <strong style={{ display: 'block', fontSize: '1.05rem' }}>
                  Gestión de pacientes
                </strong>
                <p className="data-row-meta" style={{ marginTop: '8px' }}>
                  Módulo institucional previsto para seguimiento, admisión y coordinación.
                </p>
              </div>
              <span className="action-card-label">Próximamente</span>
            </button>

            <button type="button" disabled className="action-card action-card-disabled">
              <div>
                <strong style={{ display: 'block', fontSize: '1.05rem' }}>
                  Archivos clínicos
                </strong>
                <p className="data-row-meta" style={{ marginTop: '8px' }}>
                  La consulta institucional de archivos aún no tiene vista dedicada en este
                  frontend.
                </p>
              </div>
              <span className="action-card-label">Próximamente</span>
            </button>
          </div>
        </section>
      </section>
    </DashboardLayout>
  )
}

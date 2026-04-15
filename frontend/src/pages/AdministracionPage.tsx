import { Link } from 'react-router-dom'
import { DashboardLayout } from '../layouts/DashboardLayout'

export function AdministracionPage() {
  return (
    <DashboardLayout>
      <section className="page">
        <header className="page-header">
          <h2 className="page-title">Administración</h2>
          <p className="page-subtitle">
            Vista institucional para supervisión, coordinación médica y continuidad
            operativa.
          </p>
        </header>

        <div className="page-nav">
          <Link to="/dashboard" className="page-nav-link">
            Volver al inicio
          </Link>
        </div>

        <section className="stack-md">
          <div className="stack-md" style={{ gap: '4px' }}>
            <h3 className="section-heading">Accesos institucionales</h3>
            <p className="section-caption">
              Esta vista concentra accesos reutilizables del frontend actual sin exponer
              módulos personales del paciente.
            </p>
          </div>

          <div className="cards-grid">
            <Link to="/especialidades" className="action-card action-card-primary">
              <div>
                <strong style={{ display: 'block', fontSize: '1.05rem' }}>
                  Gestión médica
                </strong>
                <p className="data-row-meta" style={{ marginTop: '8px' }}>
                  Navega por especialidades y médicos como punto de entrada institucional.
                </p>
              </div>
              <span className="action-card-label">Abrir</span>
            </Link>

            <Link to="/telemedicina" className="action-card">
              <div>
                <strong style={{ display: 'block', fontSize: '1.05rem' }}>
                  Telemedicina institucional
                </strong>
                <p className="data-row-meta" style={{ marginTop: '8px' }}>
                  Revisa el flujo remoto vigente desde una vista institucional.
                </p>
              </div>
              <span className="action-card-label">Abrir</span>
            </Link>

            <button type="button" disabled className="action-card action-card-disabled">
              <div>
                <strong style={{ display: 'block', fontSize: '1.05rem' }}>
                  Archivos clínicos
                </strong>
                <p className="data-row-meta" style={{ marginTop: '8px' }}>
                  La consulta institucional de documentación clínica aún no tiene pantalla
                  dedicada.
                </p>
              </div>
              <span className="action-card-label">Próximamente</span>
            </button>

            <button type="button" disabled className="action-card action-card-disabled">
              <div>
                <strong style={{ display: 'block', fontSize: '1.05rem' }}>
                  Reportes
                </strong>
                <p className="data-row-meta" style={{ marginTop: '8px' }}>
                  Espacio preparado para métricas, seguimiento y visibilidad ejecutiva.
                </p>
              </div>
              <span className="action-card-label">Próximamente</span>
            </button>

            <button type="button" disabled className="action-card action-card-disabled">
              <div>
                <strong style={{ display: 'block', fontSize: '1.05rem' }}>
                  Configuración
                </strong>
                <p className="data-row-meta" style={{ marginTop: '8px' }}>
                  Módulo reservado para parámetros del sistema y control administrativo.
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

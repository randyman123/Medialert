import { useMemo, useState, type PropsWithChildren } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { WhatsAppFloatingButton } from '../components/WhatsAppFloatingButton'
import { useAuth } from '../hooks/useAuth'

interface DashboardLayoutProps extends PropsWithChildren {
  showHeaderLogout?: boolean
}

interface NavigationItem {
  to: string
  title: string
  description: string
}

function getNavigation(role: string | null): NavigationItem[] {
  if (role === 'PACIENTE') {
    return [
      { to: '/dashboard', title: 'Inicio', description: 'Resumen de accesos personales y seguimiento.' },
      { to: '/especialidades', title: 'Especialidades', description: 'Agenda médica y rutas de reserva.' },
      { to: '/telemedicina', title: 'Telemedicina', description: 'Atenciones remotas y videollamadas.' },
      { to: '/mis-reservas', title: 'Mis reservas', description: 'Seguimiento y cancelación de horas.' },
      { to: '/mis-archivos', title: 'Mis archivos', description: 'Documentos clínicos personales.' },
      { to: '/pastillero', title: 'Pastillero', description: 'Medicamentos y recordatorios.' },
    ]
  }

  if (role === 'RECEPCION') {
    return [
      { to: '/dashboard', title: 'Inicio', description: 'Navegación operativa del módulo clínico.' },
      { to: '/especialidades', title: 'Gestión de agenda', description: 'Especialidades, médicos y disponibilidad.' },
      { to: '/archivos-clinicos', title: 'Archivos clínicos', description: 'Consulta documental institucional.' },
      { to: '/telemedicina', title: 'Telemedicina', description: 'Flujo remoto institucional disponible.' },
    ]
  }

  if (role === 'ADMIN') {
    return [
      { to: '/dashboard', title: 'Inicio', description: 'Resumen institucional y accesos clave.' },
      { to: '/especialidades', title: 'Gestión médica', description: 'Especialidades y estructura profesional.' },
      { to: '/archivos-clinicos', title: 'Archivos clínicos', description: 'Documentación clínica institucional.' },
    ]
  }

  return [{ to: '/dashboard', title: 'Inicio', description: 'Vista principal del sistema.' }]
}

export function DashboardLayout({ children, showHeaderLogout = true }: DashboardLayoutProps) {
  const { logout, role, userName } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  const navigationItems = useMemo(() => getNavigation(role), [role])
  const roleLabel =
    role === 'PACIENTE'
      ? 'Paciente'
      : role === 'RECEPCION'
        ? 'Recepción'
        : role === 'ADMIN'
          ? 'Administración'
          : role ?? 'Usuario'

  const handleLogout = () => {
    const confirmed = window.confirm('¿Seguro que quieres salir de MediAlert?')

    if (!confirmed) {
      return
    }

    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="dashboard-shell">
      <div className="dashboard-frame">
        <aside className="dashboard-sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-brand-mark" aria-hidden="true">
              M
            </div>
            <p className="sidebar-brand-label">MediAlert</p>
            <h1 className="sidebar-brand-title">Salud conectada y ordenada</h1>
            <p className="sidebar-brand-copy">
              Plataforma para coordinación clínica, seguimiento y atención digital.
            </p>
          </div>

          <section className="sidebar-user">
            <p className="sidebar-user-label">Sesión activa</p>
            <p className="sidebar-user-name">{userName}</p>
            <span className="sidebar-user-role">{roleLabel}</span>
          </section>

          <button
            type="button"
            className="btn btn-ghost mobile-nav-toggle"
            onClick={() => setIsMobileNavOpen((current) => !current)}
          >
            {isMobileNavOpen ? 'Ocultar menú' : 'Mostrar menú'}
          </button>

          <nav
            className={`sidebar-nav ${isMobileNavOpen ? 'sidebar-nav-open' : ''}`}
            aria-label="Navegación principal"
          >
            {navigationItems.map((item) => {
              const isActive =
                location.pathname === item.to ||
                (item.to !== '/dashboard' && location.pathname.startsWith(item.to))

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`sidebar-nav-link ${isActive ? 'sidebar-nav-link-active' : ''}`}
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  <span className="sidebar-nav-title">{item.title}</span>
                  <span className="sidebar-nav-copy">{item.description}</span>
                </NavLink>
              )
            })}
          </nav>

          <div className="sidebar-footer">
            <button type="button" onClick={handleLogout} className="btn btn-quiet">
              <svg viewBox="0 0 24 24" className="btn-icon" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M10.8 17.8 12.2 19.2 19.4 12 12.2 4.8 10.8 6.2 15.6 11H4v2h11.6zM4 19h6v2H2V3h8v2H4z"
                />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </aside>

        <div className="dashboard-main">
          <header className="dashboard-topbar">
            <div className="dashboard-topbar-copy">
              <p className="dashboard-kicker">Panel MediAlert</p>
              <h2 className="dashboard-heading">Hola, {userName}</h2>
              <p className="dashboard-copy">
                Navega tus módulos disponibles con una experiencia más clara, moderna y profesional.
              </p>
            </div>

            {showHeaderLogout ? (
              <button type="button" onClick={handleLogout} className="btn btn-quiet">
                <svg viewBox="0 0 24 24" className="btn-icon" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M10.8 17.8 12.2 19.2 19.4 12 12.2 4.8 10.8 6.2 15.6 11H4v2h11.6zM4 19h6v2H2V3h8v2H4z"
                  />
                </svg>
                Salir
              </button>
            ) : null}
          </header>

          <section className="dashboard-content">{children}</section>

          <footer className="dashboard-footer">
            <strong>MediAlert - Sistema de gestión de salud municipal</strong>
            <span>
              Plataforma orientada a coordinar atención, seguimiento y acceso digital para pacientes y equipos de salud comunal.
            </span>
            <span>Contacto: contacto@medialert.cl | +56 2 2456 7800 | Redes: @MediAlertSalud</span>
          </footer>
        </div>
      </div>

      <WhatsAppFloatingButton />
    </main>
  )
}

import { Link } from 'react-router-dom'
import { DashboardLayout } from '../layouts/DashboardLayout'

export function DashboardPage() {
  return (
    <DashboardLayout>
      <section
        style={{
          padding: '24px',
          borderRadius: '18px',
          backgroundColor: '#f6fbff',
          border: '1px solid #d9e6f2',
        }}
      >
        <h2 style={{ marginTop: 0, color: '#123047' }}>Flujo MediAlert</h2>
        <p style={{ marginBottom: '20px', color: '#4f677a' }}>
          Desde aquí puedes recorrer el flujo real: especialidad, médico y
          agenda disponible.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link
            to="/especialidades"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              padding: '12px 18px',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Ver especialidades
          </Link>

          <Link
            to="/mis-reservas"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              padding: '12px 18px',
              backgroundColor: '#123047',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Mis reservas
          </Link>
        </div>
      </section>
    </DashboardLayout>
  )
}

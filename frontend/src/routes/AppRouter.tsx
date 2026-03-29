import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AgendaPage } from '../pages/AgendaPage'
import { DashboardPage } from '../pages/DashboardPage'
import { EspecialidadesPage } from '../pages/EspecialidadesPage'
import { LoginPage } from '../pages/LoginPage'
import { MedicosPage } from '../pages/MedicosPage'
import { MisReservasPage } from '../pages/MisReservasPage'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/especialidades" element={<EspecialidadesPage />} />
          <Route path="/medicos" element={<MedicosPage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/mis-reservas" element={<MisReservasPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

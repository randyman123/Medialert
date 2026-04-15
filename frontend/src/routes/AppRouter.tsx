import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AgendaPage } from '../pages/AgendaPage'
import { AdministracionPage } from '../pages/AdministracionPage'
import { ArchivosClinicosPage } from '../pages/ArchivosClinicosPage'
import { DashboardPage } from '../pages/DashboardPage'
import { EspecialidadesPage } from '../pages/EspecialidadesPage'
import { LoginPage } from '../pages/LoginPage'
import { MedicosPage } from '../pages/MedicosPage'
import { MisArchivosPage } from '../pages/MisArchivosPage'
import { MisReservasPage } from '../pages/MisReservasPage'
import { OperacionClinicaPage } from '../pages/OperacionClinicaPage'
import { PastilleroPage } from '../pages/PastilleroPage'
import { RegisterPage } from '../pages/RegisterPage'
import { TelemedicinaAgendaPage } from '../pages/TelemedicinaAgendaPage'
import { TelemedicinaMedicosPage } from '../pages/TelemedicinaMedicosPage'
import { TelemedicinaPage } from '../pages/TelemedicinaPage'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/administracion" element={<AdministracionPage />} />
          <Route path="/archivos-clinicos" element={<ArchivosClinicosPage />} />
          <Route path="/operacion-clinica" element={<OperacionClinicaPage />} />
          <Route path="/especialidades" element={<EspecialidadesPage />} />
          <Route path="/medicos" element={<MedicosPage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/mis-reservas" element={<MisReservasPage />} />
          <Route path="/telemedicina" element={<TelemedicinaPage />} />
          <Route
            path="/telemedicina/medicos/:especialidadId"
            element={<TelemedicinaMedicosPage />}
          />
          <Route
            path="/telemedicina/agenda/:medicoId"
            element={<TelemedicinaAgendaPage />}
          />
          <Route path="/mis-archivos" element={<MisArchivosPage />} />
          <Route path="/pastillero" element={<PastilleroPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

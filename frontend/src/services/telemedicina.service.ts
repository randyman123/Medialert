import { AxiosError } from 'axios'
import { api } from './api'
import type { Especialidad } from './especialidades.service'
import type { BloqueDisponible, Medico } from './medicos.service'
import type { Reserva } from './reservas.service'

interface MedicosTelemedicinaResponse {
  especialidadId: number
  modalidad: 'TELEMEDICINA'
  medicos: Medico[]
}

interface HorariosTelemedicinaResponse {
  medico: string
  fecha: string
  bloques: BloqueDisponible[]
}

interface ReservarTelemedicinaPayload {
  bloqueHorarioId: number
  motivo: string
  observaciones?: string
  linkTelemedicina?: string
  generarSalaAutomaticamente?: boolean
}

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ message?: string | string[] }>
  const backendMessage = axiosError.response?.data?.message

  if (Array.isArray(backendMessage)) {
    return backendMessage[0] ?? fallback
  }

  return backendMessage ?? fallback
}

export const telemedicinaService = {
  async listarEspecialidades() {
    try {
      const { data } = await api.get<Especialidad[]>('/telemedicina/especialidades')
      return data
    } catch (error) {
      throw new Error(
        getErrorMessage(error, 'No se pudieron cargar las especialidades de telemedicina'),
      )
    }
  },

  async listarMedicos(especialidadId: number) {
    try {
      const { data } = await api.get<MedicosTelemedicinaResponse>(
        `/telemedicina/medicos/${especialidadId}`,
      )

      return data
    } catch (error) {
      throw new Error(
        getErrorMessage(error, 'No se pudieron cargar los médicos de telemedicina'),
      )
    }
  },

  async listarHorarios(medicoId: number, fecha: string) {
    try {
      const { data } = await api.get<HorariosTelemedicinaResponse>(
        `/telemedicina/horarios/${medicoId}`,
        {
          params: { fecha },
        },
      )

      return data
    } catch (error) {
      throw new Error(
        getErrorMessage(error, 'No se pudieron cargar los horarios de telemedicina'),
      )
    }
  },

  async reservar(payload: ReservarTelemedicinaPayload) {
    try {
      const { data } = await api.post<Reserva>('/telemedicina/reservar', payload)
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'No se pudo reservar la telemedicina'))
    }
  },
}

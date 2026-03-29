import { AxiosError } from 'axios'
import { api } from './api'
import type { Especialidad } from './especialidades.service'

interface CentroMedico {
  id: number
  nombre?: string
}

export interface Medico {
  id: number
  nombreCompleto: string
  centroMedico?: CentroMedico
  especialidades: Especialidad[]
}

interface MedicosResponse {
  datos: Medico[]
  meta: {
    pagina: number
    limite: number
    total: number
    totalPaginas: number
  }
}

export interface BloqueDisponible {
  id: number
  inicio: string
  fin: string
  estado: 'DISPONIBLE' | 'RESERVADO' | 'BLOQUEADO'
}

interface DisponibilidadResponse {
  medico: string
  fecha: string
  bloques: BloqueDisponible[]
}

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ message?: string | string[] }>
  const backendMessage = axiosError.response?.data?.message

  if (Array.isArray(backendMessage)) {
    return backendMessage[0] ?? fallback
  }

  return backendMessage ?? fallback
}

export const medicosService = {
  async listarPorEspecialidad(especialidadId: number) {
    try {
      const { data } = await api.get<MedicosResponse>('/medicos', {
        params: { especialidadId },
      })

      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'No se pudieron cargar los médicos'))
    }
  },

  async obtenerDisponibilidad(medicoId: number, fecha: string) {
    try {
      const { data } = await api.get<DisponibilidadResponse>(
        `/medicos/${medicoId}/disponibilidad`,
        {
          params: { fecha },
        },
      )

      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'No se pudo cargar la agenda'))
    }
  },
}

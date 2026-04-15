import { AxiosError } from 'axios'
import { api } from './api'

export type EstadoReserva = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA'
export type ModalidadReserva = 'PRESENCIAL' | 'TELEMEDICINA'

interface MedicoReserva {
  id: number
  nombreCompleto: string
}

interface BloqueHorarioReserva {
  id: number
  inicio: string
  fin: string
  estado: 'DISPONIBLE' | 'RESERVADO' | 'BLOQUEADO'
}

export interface Reserva {
  id: number
  estado: EstadoReserva
  modalidad?: ModalidadReserva
  motivo?: string
  linkTelemedicina?: string | null
  observaciones?: string | null
  creadoEn: string
  medico: MedicoReserva
  bloqueHorario: BloqueHorarioReserva
}

interface CrearReservaPayload {
  bloqueHorarioId: number
  motivo: string
}

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ message?: string | string[] }>
  const backendMessage = axiosError.response?.data?.message

  if (Array.isArray(backendMessage)) {
    return backendMessage[0] ?? fallback
  }

  return backendMessage ?? fallback
}

export const reservasService = {
  async crear(payload: CrearReservaPayload) {
    try {
      const { data } = await api.post<Reserva>('/reservas', payload)
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'No se pudo crear la reserva'))
    }
  },

  async listarMis() {
    try {
      const { data } = await api.get<Reserva[]>('/reservas/mis')
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'No se pudieron cargar tus reservas'))
    }
  },

  async cancelar(reservaId: number) {
    try {
      const { data } = await api.patch<Reserva>(`/reservas/${reservaId}/cancelar`)
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'No se pudo cancelar la reserva'))
    }
  },
}

import { AxiosError } from 'axios'
import { api } from './api'

export interface MedicamentoPaciente {
  id: number
  nombreMedicamento: string
  dosis: string | null
  horaInicio: string
  fechaInicio: string
  frecuenciaHoras: number
  duracionDias: number
  alarmaActiva: boolean
  recordarMinutosAntes?: number
  whatsappRecordatorioActivo?: boolean
  observaciones: string | null
  activo: boolean
  pacienteId: number
  fechaFinEstimada: string
  proximaDosisEstimada: string | null
  proximoRecordatorioEstimado?: string | null
  creadoEn: string
  actualizadoEn: string
}

export interface MedicamentoPayload {
  nombreMedicamento: string
  dosis?: string
  horaInicio: string
  fechaInicio: string
  frecuenciaHoras: number
  duracionDias: number
  alarmaActiva: boolean
  recordarMinutosAntes?: number
  whatsappRecordatorioActivo?: boolean
  observaciones?: string
}

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ message?: string | string[] }>
  const backendMessage = axiosError.response?.data?.message

  if (Array.isArray(backendMessage)) {
    return backendMessage[0] ?? fallback
  }

  return backendMessage ?? fallback
}

export const pastilleroService = {
  async listarMis() {
    try {
      const { data } = await api.get<MedicamentoPaciente[]>('/pastillero/mis')
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'No se pudo cargar el pastillero'))
    }
  },

  async obtener(id: number) {
    try {
      const { data } = await api.get<MedicamentoPaciente>(`/pastillero/${id}`)
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'No se pudo cargar el medicamento'))
    }
  },

  async crear(payload: MedicamentoPayload) {
    try {
      const { data } = await api.post<MedicamentoPaciente>('/pastillero', payload)
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'No se pudo registrar el medicamento'))
    }
  },

  async actualizar(id: number, payload: MedicamentoPayload) {
    try {
      const { data } = await api.patch<MedicamentoPaciente>(`/pastillero/${id}`, payload)
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'No se pudo actualizar el medicamento'))
    }
  },

  async eliminar(id: number) {
    try {
      const { data } = await api.delete<{ mensaje: string }>(`/pastillero/${id}`)
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'No se pudo desactivar el medicamento'))
    }
  },
}

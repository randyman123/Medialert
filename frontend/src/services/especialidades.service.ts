import { AxiosError } from 'axios'
import { api } from './api'

export interface Especialidad {
  id: number
  nombre: string
}

function getErrorMessage(error: unknown) {
  const axiosError = error as AxiosError<{ message?: string | string[] }>
  const backendMessage = axiosError.response?.data?.message

  if (Array.isArray(backendMessage)) {
    return backendMessage[0] ?? 'No se pudieron cargar las especialidades'
  }

  return backendMessage ?? 'No se pudieron cargar las especialidades'
}

export const especialidadesService = {
  async listar() {
    try {
      const { data } = await api.get<Especialidad[]>('/especialidades')
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },
}

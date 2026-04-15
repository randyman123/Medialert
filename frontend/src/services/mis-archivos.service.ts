import { AxiosError } from 'axios'
import { api } from './api'

export type CategoriaArchivo = 'EXAMEN' | 'RECETA' | 'ORDEN' | 'INFORME' | 'OTRO'

export interface ArchivoPaciente {
  id: number
  nombreOriginal: string
  nombreInterno: string
  rutaRelativa: string
  tipoMime: string
  tamano?: number
  categoria: CategoriaArchivo
  fechaSubida: string
  pacienteId: number
  usuarioCreadorId: number
}

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ message?: string | string[] }>
  const backendMessage = axiosError.response?.data?.message

  if (Array.isArray(backendMessage)) {
    return backendMessage[0] ?? fallback
  }

  return backendMessage ?? fallback
}

function getFilenameFromHeaders(contentDisposition?: string) {
  if (!contentDisposition) {
    return 'archivo'
  }

  const encodedMatch = contentDisposition.match(/filename="([^"]+)"/)

  if (!encodedMatch?.[1]) {
    return 'archivo'
  }

  try {
    return decodeURIComponent(encodedMatch[1])
  } catch {
    return encodedMatch[1]
  }
}

export const misArchivosService = {
  async listarMis() {
    try {
      const { data } = await api.get<ArchivoPaciente[]>('/mis-archivos/mis')
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'No se pudieron cargar tus archivos'))
    }
  },

  async listarPorPaciente(pacienteId: number) {
    try {
      const { data } = await api.get<ArchivoPaciente[]>(
        `/mis-archivos/pacientes/${pacienteId}`,
      )
      return data
    } catch (error) {
      throw new Error(
        getErrorMessage(error, 'No se pudieron cargar los archivos clínicos'),
      )
    }
  },

  async subir(categoria: CategoriaArchivo, archivo: File) {
    try {
      const formData = new FormData()
      formData.append('categoria', categoria)
      formData.append('archivo', archivo)

      const { data } = await api.post<ArchivoPaciente>('/mis-archivos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'No se pudo subir el archivo'))
    }
  },

  async descargar(id: number) {
    try {
      const response = await api.get<Blob>(`/mis-archivos/${id}/descargar`, {
        responseType: 'blob',
      })

      const blobUrl = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = getFilenameFromHeaders(response.headers['content-disposition'])
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      throw new Error(getErrorMessage(error, 'No se pudo descargar el archivo'))
    }
  },

  async eliminar(id: number) {
    try {
      const { data } = await api.delete<{ mensaje: string }>(`/mis-archivos/${id}`)
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'No se pudo eliminar el archivo'))
    }
  },
}

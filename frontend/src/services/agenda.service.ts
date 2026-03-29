import { medicosService } from './medicos.service'

export const agendaService = {
  async obtenerPorMedicoYFecha(medicoId: number, fecha: string) {
    return medicosService.obtenerDisponibilidad(medicoId, fecha)
  },
}

import { Pastillero } from './entities/pastillero.entity';

export function combinarFechaYHora(fecha: string, hora: string) {
  const [horas, minutos] = hora.split(':').map(Number);
  const resultado = new Date(`${fecha}T00:00:00`);
  resultado.setHours(horas, minutos, 0, 0);
  return resultado;
}

export function formatearFechaLocal(fecha: Date) {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function calcularFechaFinTratamiento(medicamento: Pastillero) {
  const fechaBase = new Date(`${medicamento.fechaInicio}T00:00:00`);
  fechaBase.setDate(fechaBase.getDate() + medicamento.duracionDias - 1);
  return fechaBase;
}

export function calcularFechaFinTratamientoCompleta(medicamento: Pastillero) {
  const fechaFin = calcularFechaFinTratamiento(medicamento);
  fechaFin.setHours(23, 59, 59, 999);
  return fechaFin;
}

export function calcularProximaDosis(medicamento: Pastillero, ahora = new Date()) {
  if (!medicamento.activo || !medicamento.alarmaActiva) {
    return null;
  }

  const inicio = combinarFechaYHora(medicamento.fechaInicio, medicamento.horaInicio);
  const finTratamiento = calcularFechaFinTratamientoCompleta(medicamento);

  if (ahora <= inicio) {
    return inicio;
  }

  const frecuenciaMs = medicamento.frecuenciaHoras * 60 * 60 * 1000;
  const transcurrido = ahora.getTime() - inicio.getTime();
  const dosisTranscurridas = Math.floor(transcurrido / frecuenciaMs) + 1;
  const proxima = new Date(inicio.getTime() + dosisTranscurridas * frecuenciaMs);

  if (proxima > finTratamiento) {
    return null;
  }

  return proxima;
}

export function calcularProximoRecordatorio(
  medicamento: Pastillero,
  ahora = new Date(),
) {
  const proximaDosis = calcularProximaDosis(medicamento, ahora);

  if (!proximaDosis) {
    return null;
  }

  return new Date(
    proximaDosis.getTime() - medicamento.recordarMinutosAntes * 60 * 1000,
  );
}

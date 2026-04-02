import { CategoriaArchivo } from './categoria-archivo.enum';

export const DIRECTORIO_BASE_MIS_ARCHIVOS = 'storage/mis-archivos';
export const MAX_TAMANO_ARCHIVO_BYTES = 10 * 1024 * 1024;
export const TIPOS_MIME_PERMITIDOS = new Set<string>([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const CATEGORIAS_ARCHIVO = Object.values(CategoriaArchivo);

export function esCategoriaArchivo(value: unknown): value is CategoriaArchivo {
  return (
    typeof value === 'string' &&
    CATEGORIAS_ARCHIVO.includes(value as CategoriaArchivo)
  );
}

export function obtenerCategoriaSegura(value: unknown): CategoriaArchivo {
  return esCategoriaArchivo(value) ? value : CategoriaArchivo.OTRO;
}

import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import {
  DIRECTORIO_BASE_MIS_ARCHIVOS,
  MAX_TAMANO_ARCHIVO_BYTES,
  TIPOS_MIME_PERMITIDOS,
  obtenerCategoriaSegura,
} from './mis-archivos.constants';

export const misArchivosMulterOptions = {
  storage: diskStorage({
    destination: (req, _file, callback) => {
      try {
        const usuarioId =
          typeof req?.usuario?.id === 'number' ? req.usuario.id : 'anonimo';
        const categoria = obtenerCategoriaSegura(req?.body?.categoria);
        const destino = join(
          process.cwd(),
          DIRECTORIO_BASE_MIS_ARCHIVOS,
          `usuario-${usuarioId}`,
          categoria,
        );

        mkdirSync(destino, { recursive: true });
        callback(null, destino);
      } catch (error) {
        callback(error as Error, '');
      }
    },
    filename: (_req, file, callback) => {
      const extension = extname(file.originalname).toLowerCase();
      callback(null, `${randomUUID()}${extension}`);
    },
  }),
  limits: {
    fileSize: MAX_TAMANO_ARCHIVO_BYTES,
  },
  fileFilter: (
    _req: unknown,
    file: { mimetype: string },
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!TIPOS_MIME_PERMITIDOS.has(file.mimetype)) {
      callback(new BadRequestException('Tipo de archivo no permitido'), false);
      return;
    }

    callback(null, true);
  },
};

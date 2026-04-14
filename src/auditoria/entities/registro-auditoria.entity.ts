import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RolUsuario } from '../../usuarios/rol-usuario.enum';

export type AccionAuditoria =
  | 'RESERVA_CREADA'
  | 'RESERVA_CANCELADA'
  | 'ARCHIVO_SUBIDO'
  | 'ARCHIVO_ELIMINADO'
  | 'PASTILLERO_RECORDATORIO_GENERADO';

@Entity({ name: 'registro_auditoria' })
export class RegistroAuditoria {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({
    type: 'enum',
    enum: [
      'RESERVA_CREADA',
      'RESERVA_CANCELADA',
      'ARCHIVO_SUBIDO',
      'ARCHIVO_ELIMINADO',
      'PASTILLERO_RECORDATORIO_GENERADO',
    ],
  })
  accion!: AccionAuditoria;

  @Column({ name: 'entidad', length: 50 })
  entidad!: string; // ejemplo: 'Reserva'

  @Column({ name: 'entidad_id', type: 'bigint' })
  entidadId!: number;

  @Column({ name: 'usuario_id', type: 'bigint', nullable: true })
  usuarioId!: number | null;

  @Column({ type: 'enum', enum: RolUsuario, nullable: true })
  rol!: RolUsuario | null;

  @Column({ type: 'json', nullable: true })
  detalle!: any;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn!: Date;
}

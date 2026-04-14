import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pastillero } from './pastillero.entity';

@Entity({ name: 'recordatorios_medicamento' })
@Index('IDX_RECORDATORIO_EVENTO_CLAVE', ['eventoClave'], { unique: true })
export class RecordatorioMedicamento {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'evento_clave', length: 190 })
  eventoClave!: string;

  @Column({ name: 'tipo', length: 20 })
  tipo!: 'EXACTO' | 'ANTICIPADO';

  @Column({ name: 'minutos_antes', type: 'int', default: 0 })
  minutosAntes!: number;

  @Column({ name: 'fecha_dosis_programada', type: 'datetime' })
  fechaDosisProgramada!: Date;

  @Column({ name: 'fecha_recordatorio', type: 'datetime' })
  fechaRecordatorio!: Date;

  @Column({ name: 'canal', length: 50, default: 'internal-log' })
  canal!: string;

  @Column({ name: 'proveedor', length: 30, default: 'mock' })
  proveedor!: string;

  @CreateDateColumn({ name: 'generado_en' })
  generadoEn!: Date;

  @ManyToOne(() => Pastillero, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'medicamento_id' })
  medicamento!: Pastillero;
}

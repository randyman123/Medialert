import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity';

@Entity({ name: 'pastillero' })
@Index('IDX_PASTILLERO_PACIENTE_ACTIVO', ['paciente', 'activo'])
export class Pastillero {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'nombre_medicamento', length: 150 })
  nombreMedicamento!: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  dosis?: string | null;

  @Column({ name: 'hora_inicio', type: 'varchar', length: 5 })
  horaInicio!: string;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio!: string;

  @Column({ name: 'frecuencia_horas', type: 'int' })
  frecuenciaHoras!: number;

  @Column({ name: 'duracion_dias', type: 'int' })
  duracionDias!: number;

  @Column({ name: 'alarma_activa', default: true })
  alarmaActiva!: boolean;

  @Column({ nullable: true, type: 'text' })
  observaciones?: string | null;

  @Column({ default: true })
  activo!: boolean;

  @ManyToOne(() => Paciente, { nullable: false, eager: true })
  @JoinColumn({ name: 'paciente_id' })
  paciente!: Paciente;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn!: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn!: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity';
import { Medico } from '../../medicos/entities/medico.entity';
import { BloqueHorario } from '../../bloques-horarios/entities/bloques-horario.entity';
import { ModalidadAtencion } from '../../common/enums/modalidad-atencion.enum';

export type EstadoReserva = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA';

@Entity({ name: 'reservas' })
export class Reserva {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @ManyToOne(() => Paciente, { nullable: false, eager: true })
  paciente!: Paciente;

  @ManyToOne(() => Medico, { nullable: false, eager: true })
  medico!: Medico;

  @ManyToOne(() => BloqueHorario, { nullable: false, eager: true })
  bloqueHorario!: BloqueHorario;

  @Column({
    type: 'enum',
    enum: ['PENDIENTE', 'CONFIRMADA', 'CANCELADA'],
    default: 'PENDIENTE',
  })
  estado!: EstadoReserva;

  @Column({ nullable: true, length: 255 })
  motivo?: string;

  @Column({
    type: 'enum',
    enum: ModalidadAtencion,
    default: ModalidadAtencion.PRESENCIAL,
  })
  modalidad!: ModalidadAtencion;

  @Column({
    name: 'link_telemedicina',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  linkTelemedicina?: string | null;

  @Column({ type: 'text', nullable: true })
  observaciones?: string | null;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn!: Date;
}

import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Medico } from '../../medicos/entities/medico.entity';
import { ModalidadAtencion } from '../../common/enums/modalidad-atencion.enum';

export type EstadoBloque = 'DISPONIBLE' | 'RESERVADO' | 'BLOQUEADO';

@Entity({ name: 'bloques_horarios' })
export class BloqueHorario {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @ManyToOne(() => Medico, { nullable: false })
  medico!: Medico;

  @Column({ name: 'inicio', type: 'datetime' })
  inicio!: Date;

  @Column({ name: 'fin', type: 'datetime' })
  fin!: Date;

  @Column({
    type: 'enum',
    enum: ['DISPONIBLE', 'RESERVADO', 'BLOQUEADO'],
    default: 'DISPONIBLE',
  })
  estado!: EstadoBloque;

  @Column({
    type: 'enum',
    enum: ModalidadAtencion,
    default: ModalidadAtencion.PRESENCIAL,
  })
  modalidad!: ModalidadAtencion;
}

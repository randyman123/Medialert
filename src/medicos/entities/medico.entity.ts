import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CentroMedico } from '../../centros-medicos/entities/centro-medico.entity';
import { Especialidad } from '../../especialidades/entities/especialidad.entity';

@Entity({ name: 'medicos' })
export class Medico {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'nombre_completo', length: 120 })
  nombreCompleto!: string;

  @ManyToOne(() => CentroMedico, { nullable: false })
  centroMedico!: CentroMedico;

  @ManyToMany(() => Especialidad, { eager: true })
  @JoinTable({
    name: 'medicos_especialidades',
    joinColumn: { name: 'medico_id' },
    inverseJoinColumn: { name: 'especialidad_id' },
  })
  especialidades!: Especialidad[];
}

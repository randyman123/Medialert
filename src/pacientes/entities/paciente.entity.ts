import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity({ name: 'pacientes' })
export class Paciente {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'nombre_completo', length: 120 })
  nombreCompleto!: string;

  @Column({ length: 30, nullable: true })
  telefono?: string;

  @Column({ length: 120, nullable: true })
  correo?: string;

  @OneToOne(() => Usuario, { nullable: false, eager: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn!: Date;
}
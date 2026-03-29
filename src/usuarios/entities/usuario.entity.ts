import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
} from 'typeorm';
import { RolUsuario } from '../rol-usuario.enum';
import { Paciente } from '../../pacientes/entities/paciente.entity';

@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ unique: true, length: 120 })
  correo!: string;

  @Column({ name: 'hash_contrasena', length: 255, select: false })
  hashContrasena!: string;

  @Column({
    type: 'enum',
    enum: RolUsuario,
    default: RolUsuario.PACIENTE,
  })
  rol!: RolUsuario;

  @Column({ name: 'activo', default: true })
  activo!: boolean;

  @OneToOne(() => Paciente, (paciente) => paciente.usuario)
  paciente?: Paciente;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn!: Date;
}

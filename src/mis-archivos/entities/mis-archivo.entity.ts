import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CategoriaArchivo } from '../categoria-archivo.enum';
import { Paciente } from '../../pacientes/entities/paciente.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity({ name: 'mis_archivos' })
export class MisArchivo {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'nombre_original', length: 255 })
  nombreOriginal!: string;

  @Column({ name: 'nombre_interno', length: 255 })
  nombreInterno!: string;

  @Column({ name: 'ruta_relativa', length: 500 })
  rutaRelativa!: string;

  @Column({ name: 'tipo_mime', length: 120 })
  tipoMime!: string;

  @Column({ name: 'tamano', type: 'int' })
  tamano!: number;

  @Column({ type: 'enum', enum: CategoriaArchivo })
  categoria!: CategoriaArchivo;

  @CreateDateColumn({ name: 'fecha_subida' })
  fechaSubida!: Date;

  @ManyToOne(() => Paciente, { nullable: false })
  @JoinColumn({ name: 'paciente_id' })
  paciente!: Paciente;

  @ManyToOne(() => Usuario, { nullable: false })
  @JoinColumn({ name: 'usuario_creador_id' })
  usuarioCreador!: Usuario;
}

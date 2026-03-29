import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'centros_medicos' })
export class CentroMedico {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ length: 120 })
  nombre!: string;

  @Column({ length: 200 })
  direccion!: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn!: Date;
}

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'especialidades' })
export class Especialidad {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ length: 120, unique: true })
  nombre!: string;
}

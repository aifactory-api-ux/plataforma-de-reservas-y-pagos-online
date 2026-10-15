import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { InscripcionClase } from './inscripcion-clase.entity';

@Entity('jugador')
export class Jugador {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 20 })
  telefono: string;

  @Column({ name: 'bloqueado', default: false })
  bloqueado: boolean;

  @Column({ name: 'inasistencias_60dias', default: 0 })
  inasistencias60Dias: number;

  @Column({ name: 'google_id', length: 255, nullable: true })
  googleId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => InscripcionClase, (inscripcion) => inscripcion.jugador)
  inscripciones: InscripcionClase[];
}

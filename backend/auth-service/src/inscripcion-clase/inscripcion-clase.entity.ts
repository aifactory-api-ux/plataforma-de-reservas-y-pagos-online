import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Clase } from '../clase/clase.entity';
import { Jugador } from '../jugador/jugador.entity';

export type InscripcionEstado = 'activa' | 'cancelada';

@Entity('inscripcion_clase')
export class InscripcionClase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'clase_id' })
  claseId: number;

  @Column({ name: 'jugador_id' })
  jugadorId: number;

  @CreateDateColumn({ name: 'inscrita_en' })
  inscritaEn: Date;

  @Column({ length: 20, default: 'activa' })
  estado: InscripcionEstado;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Clase, (clase) => clase.inscripciones)
  @JoinColumn({ name: 'clase_id' })
  clase: Clase;

  @ManyToOne(() => Jugador, (jugador) => jugador.inscripciones)
  @JoinColumn({ name: 'jugador_id' })
  jugador: Jugador;
}

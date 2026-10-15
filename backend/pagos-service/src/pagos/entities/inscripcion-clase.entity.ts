import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Clase } from './clase.entity';
import { Jugador } from './jugador.entity';

@Entity('inscripcion_clase')
export class InscripcionClase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'clase_id' })
  claseId: number;

  @Column({ name: 'jugador_id' })
  jugadorId: number;

  @Column({ name: 'inscrita_en', type: 'timestamp with time zone' })
  inscritaEn: Date;

  @Column({ length: 20, default: 'activa' })
  estado: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Clase, (clase) => clase.inscripciones)
  @JoinColumn({ name: 'clase_id' })
  clase: Clase;

  @ManyToOne(() => Jugador, (jugador) => jugador.inscripciones)
  @JoinColumn({ name: 'jugador_id' })
  jugador: Jugador;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Jugador } from './jugador.entity';

@Entity('consentimiento_datos')
export class ConsentimientoDatos {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'jugador_id' })
  jugadorId: number;

  @Column({ length: 20 })
  version: string;

  @Column({ name: 'fecha_consentimiento', type: 'timestamp with time zone' })
  fechaConsentimiento: Date;

  @Column()
  aceptado: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Jugador, (jugador) => jugador.consentimientos)
  @JoinColumn({ name: 'jugador_id' })
  jugador: Jugador;
}
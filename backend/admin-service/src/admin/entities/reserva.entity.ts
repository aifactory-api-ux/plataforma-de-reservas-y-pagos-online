import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Jugador } from './jugador.entity';
import { Cancha } from './cancha.entity';
import { Tarifa } from './tarifa.entity';

export type ReservaEstado = 'retenida' | 'pagada' | 'cancelada' | 'asistio' | 'no_asistio';

@Entity('reserva')
export class Reserva {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'jugador_id' })
  jugadorId: number;

  @Column({ name: 'cancha_id' })
  canchaId: number;

  @Column({ name: 'tarifa_id' })
  tarifaId: number;

  @Column({ type: 'timestamp with time zone' })
  inicio: Date;

  @Column({ type: 'timestamp with time zone' })
  fin: Date;

  @Column({ length: 20 })
  estado: ReservaEstado;

  @CreateDateColumn({ name: 'creada_en' })
  creadaEn: Date;

  @Column({ name: 'confirmada_en', type: 'timestamp with time zone', nullable: true })
  confirmadaEn: Date;

  @ManyToOne(() => Jugador)
  @JoinColumn({ name: 'jugador_id' })
  jugador: Jugador;

  @ManyToOne(() => Cancha)
  @JoinColumn({ name: 'cancha_id' })
  cancha: Cancha;

  @ManyToOne(() => Tarifa)
  @JoinColumn({ name: 'tarifa_id' })
  tarifa: Tarifa;
}

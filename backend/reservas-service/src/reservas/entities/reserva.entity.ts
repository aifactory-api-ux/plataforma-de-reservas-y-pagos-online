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
import { Pago } from './pago.entity';
import { BloqueoCancha } from './bloqueo-cancha.entity';

export type ReservationStatus = 'retenida' | 'pagada' | 'cancelada' | 'asistio' | 'no_asistio';

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

  @Column({ length: 20, default: 'retenida' })
  estado: ReservationStatus;

  @CreateDateColumn({ name: 'creada_en' })
  creadaEn: Date;

  @Column({ name: 'confirmada_en', type: 'timestamp with time zone', nullable: true })
  confirmadaEn: Date | null;

  @ManyToOne(() => Jugador, (jugador) => jugador.reservas)
  @JoinColumn({ name: 'jugador_id' })
  jugador: Jugador;

  @ManyToOne(() => Cancha, (cancha) => cancha.reservas)
  @JoinColumn({ name: 'cancha_id' })
  cancha: Cancha;

  @ManyToOne(() => Tarifa, (tarifa) => tarifa.reservas)
  @JoinColumn({ name: 'tarifa_id' })
  tarifa: Tarifa;

  @ManyToOne(() => Pago, (pago) => pago.reserva)
  pago: Pago | null;

  @ManyToOne(() => BloqueoCancha, (bloqueo) => bloqueo.reserva)
  bloqueo: BloqueoCancha | null;
}
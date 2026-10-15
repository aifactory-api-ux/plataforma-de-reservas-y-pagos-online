import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cancha } from './cancha.entity';
import { Reserva } from './reserva.entity';

@Entity('bloqueo_cancha')
export class BloqueoCancha {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cancha_id' })
  canchaId: number;

  @Column({ name: 'reserva_id', nullable: true })
  reservaId: number | null;

  @Column({ type: 'timestamp with time zone' })
  inicio: Date;

  @Column({ type: 'timestamp with time zone' })
  fin: Date;

  @Column({ length: 20, default: 'activo' })
  estado: string;

  @Column({ length: 255, nullable: true })
  motivo: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Cancha, (cancha) => cancha.bloques)
  @JoinColumn({ name: 'cancha_id' })
  cancha: Cancha;

  @ManyToOne(() => Reserva, (reserva) => reserva.bloqueo)
  @JoinColumn({ name: 'reserva_id' })
  reserva: Reserva | null;
}

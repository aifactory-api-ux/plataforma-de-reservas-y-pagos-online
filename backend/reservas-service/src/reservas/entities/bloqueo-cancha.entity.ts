import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cancha } from './cancha.entity';
import { Reserva } from './reserva.entity';

export type BloqueoCanchaEstado = 'activo' | 'liberado';

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
  estado: BloqueoCanchaEstado;

  @Column({ length: 255, nullable: true })
  motivo: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Cancha, (cancha) => cancha.bloques)
  @JoinColumn({ name: 'cancha_id' })
  cancha: Cancha;

  @ManyToOne(() => Reserva, (reserva) => reserva.bloqueo)
  @JoinColumn({ name: 'reserva_id' })
  reserva: Reserva | null;
}
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Reserva } from './reserva.entity';

@Entity('tarifa')
export class Tarifa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  deporte: string;

  @Column({ name: 'duracion_minutos' })
  duracionMinutos: number;

  @Column({ length: 10 })
  franja: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Reserva, (reserva) => reserva.tarifa)
  reservas: Reserva[];
}

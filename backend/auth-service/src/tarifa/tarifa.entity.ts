import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Reserva } from '../reserva/reserva.entity';

export type TarifaDeporte = 'padel' | 'futbol7';
export type TarifaFranja = 'manana' | 'tarde' | 'noche';

@Entity('tarifa')
export class Tarifa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  deporte: TarifaDeporte;

  @Column({ name: 'duracion_minutos' })
  duracionMinutos: number;

  @Column({ length: 10 })
  franja: TarifaFranja;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Reserva, (reserva) => reserva.tarifa)
  reservas: Reserva[];
}

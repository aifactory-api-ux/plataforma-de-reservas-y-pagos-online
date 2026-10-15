import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sede } from './sede.entity';

export type CanchaDeporte = 'padel' | 'futbol7';
export type CanchaEstado = 'disponible' | 'mantenimiento' | 'bloqueada';

@Entity('cancha')
export class Cancha {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sede_id' })
  sedeId: number;

  @Column({ length: 20 })
  deporte: CanchaDeporte;

  @Column({ default: false })
  techada: boolean;

  @Column({ length: 20 })
  estado: CanchaEstado;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Sede)
  @JoinColumn({ name: 'sede_id' })
  sede: Sede;
}

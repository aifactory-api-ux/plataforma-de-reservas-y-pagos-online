import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Clase } from '../clases/entities/clase.entity';

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

  @Column({ name: 'techada' })
  techada: boolean;

  @Column({ length: 20, default: 'disponible' })
  estado: CanchaEstado;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Clase, (clase) => clase.cancha)
  clases: Clase[];
}

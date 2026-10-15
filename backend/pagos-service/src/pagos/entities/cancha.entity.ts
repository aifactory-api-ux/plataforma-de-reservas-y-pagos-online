import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Reserva } from './reserva.entity';
import { BloqueoCancha } from './bloqueo-cancha.entity';
import { Clase } from './clase.entity';

@Entity('sede')
export class Sede {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre', length: 100 })
  nombre: string;

  @Column({ length: 255 })
  direccion: string;

  @Column({ length: 20 })
  telefono: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Cancha, (cancha) => cancha.sede)
  canchas: Cancha[];
}

@Entity('cancha')
export class Cancha {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sede_id' })
  sedeId: number;

  @Column({ length: 20 })
  deporte: string;

  @Column({ default: false })
  techada: boolean;

  @Column({ length: 20, default: 'disponible' })
  estado: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Sede, (sede) => sede.canchas)
  @JoinColumn({ name: 'sede_id' })
  sede: Sede;

  @OneToMany(() => Reserva, (reserva) => reserva.cancha)
  reservas: Reserva[];

  @OneToMany(() => BloqueoCancha, (bloqueo) => bloqueo.cancha)
  bloques: BloqueoCancha[];

  @OneToMany(() => Clase, (clase) => clase.cancha)
  clases: Clase[];
}

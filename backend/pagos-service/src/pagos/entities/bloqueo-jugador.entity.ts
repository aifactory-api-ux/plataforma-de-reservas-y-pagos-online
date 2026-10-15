import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Jugador } from './jugador.entity';
import { UsuarioPersonal } from './usuario-personal.entity';

@Entity('bloqueo_jugador')
export class BloqueoJugador {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'jugador_id' })
  jugadorId: number;

  @Column({ name: 'creado_por' })
  creadoPorId: number;

  @Column({ type: 'text' })
  motivo: string;

  @Column({ type: 'timestamp with time zone' })
  inicio: Date;

  @Column({ type: 'timestamp with time zone' })
  fin: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Jugador, (jugador) => jugador.bloqueos)
  @JoinColumn({ name: 'jugador_id' })
  jugador: Jugador;

  @ManyToOne(() => UsuarioPersonal, (usuario) => usuario.bloqueosCreados)
  @JoinColumn({ name: 'creado_por' })
  creadoPor: UsuarioPersonal;
}

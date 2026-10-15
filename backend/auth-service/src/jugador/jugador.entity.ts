import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ConsentimientoDatos } from '../consentimiento/consentimiento-datos.entity';
import { Reserva } from '../reserva/reserva.entity';
import { BloqueoJugador } from '../bloqueo-jugador/bloqueo-jugador.entity';
import { InscripcionClase } from '../inscripcion-clase/inscripcion-clase.entity';

@Entity('jugador')
export class Jugador {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 20 })
  telefono: string;

  @Column({ name: 'bloqueado', default: false })
  bloqueado: boolean;

  @Column({ name: 'inasistencias_60dias', default: 0 })
  inasistencias60Dias: number;

  @Column({ name: 'google_id', length: 255, nullable: true, unique: true })
  googleId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ConsentimientoDatos, (consentimiento) => consentimiento.jugador)
  consentimientos: ConsentimientoDatos[];

  @OneToMany(() => Reserva, (reserva) => reserva.jugador)
  reservas: Reserva[];

  @OneToMany(() => BloqueoJugador, (bloqueo) => bloqueo.jugador)
  bloqueos: BloqueoJugador[];

  @OneToMany(() => InscripcionClase, (inscripcion) => inscripcion.jugador)
  inscripciones: InscripcionClase[];
}

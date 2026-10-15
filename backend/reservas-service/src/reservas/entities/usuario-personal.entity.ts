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
import { Sede } from './sede.entity';
import { BloqueoJugador } from './bloqueo-jugador.entity';
import { Devolucion } from './devolucion.entity';
import { Clase } from './clase.entity';

export type UsuarioPersonalRol = 'encargado' | 'profesor' | 'administrador';

@Entity('usuario_personal')
export class UsuarioPersonal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sede_id' })
  sedeId: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ length: 20 })
  rol: UsuarioPersonalRol;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Sede, (sede) => sede.usuarios)
  @JoinColumn({ name: 'sede_id' })
  sede: Sede;

  @OneToMany(() => BloqueoJugador, (bloqueo) => bloqueo.creadoPor)
  bloqueosCreados: BloqueoJugador[];

  @OneToMany(() => Devolucion, (devolucion) => devolucion.autorizadoPor)
  devolucionesAutorizadas: Devolucion[];

  @OneToMany(() => Clase, (clase) => clase.profesor)
  clasesImpartidas: Clase[];
}
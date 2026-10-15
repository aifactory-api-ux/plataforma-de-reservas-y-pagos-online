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

export type UsuarioRol = 'encargado' | 'profesor' | 'administrador';

@Entity('usuario_personal')
export class UsuarioPersonal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sede_id' })
  sedeId: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 255 })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ length: 20 })
  rol: UsuarioRol;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Sede, (sede) => sede.usuarios)
  @JoinColumn({ name: 'sede_id' })
  sede: Sede;
}

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
import { Cancha } from '../../球场/cancha.entity';
import { UsuarioPersonal } from './usuario-personal.entity';
import { InscripcionClase } from './inscripcion-clase.entity';

@Entity('clase')
export class Clase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cancha_id' })
  canchaId: number;

  @Column({ name: 'profesor_id' })
  profesorId: number;

  @Column({ type: 'timestamp with time zone' })
  inicio: Date;

  @Column({ type: 'timestamp with time zone' })
  fin: Date;

  @Column({ length: 100 })
  nombre: string;

  @Column()
  cupos: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Cancha, (cancha) => cancha.clases)
  @JoinColumn({ name: 'cancha_id' })
  cancha: Cancha;

  @ManyToOne(() => UsuarioPersonal)
  @JoinColumn({ name: 'profesor_id' })
  profesor: UsuarioPersonal;

  @OneToMany(() => InscripcionClase, (inscripcion) => inscripcion.clase)
  inscripciones: InscripcionClase[];
}

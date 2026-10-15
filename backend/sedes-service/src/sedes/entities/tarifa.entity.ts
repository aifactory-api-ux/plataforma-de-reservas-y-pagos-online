import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tarifa')
export class Tarifa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  deporte: 'padel' | 'futbol7';

  @Column({ name: 'duracion_minutos' })
  duracionMinutos: number;

  @Column({ length: 10 })
  franja: 'manana' | 'tarde' | 'noche';

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

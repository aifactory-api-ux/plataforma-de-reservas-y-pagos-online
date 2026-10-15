import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pago } from './pago.entity';

@Entity('devolucion')
export class Devolucion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'pago_id' })
  pagoId: number;

  @Column({ name: 'autorizado_por' })
  autorizadoPorId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @Column({ type: 'text' })
  motivo: string;

  @CreateDateColumn({ name: 'creada_en' })
  creadaEn: Date;

  @ManyToOne(() => Pago, (pago) => pago.devolucion)
  @JoinColumn({ name: 'pago_id' })
  pago: Pago;
}

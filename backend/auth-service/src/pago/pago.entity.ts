import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Reserva } from '../reserva/reserva.entity';
import { Devolucion } from '../devolucion/devolucion.entity';

export type PagoEstado = 'pendiente' | 'completado' | 'fallido' | 'reembolsado';

@Entity('pago')
export class Pago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'reserva_id' })
  reservaId: number;

  @Column({ name: 'monto_total', type: 'decimal', precision: 10, scale: 2 })
  montoTotal: number;

  @Column({ length: 20, default: 'pendiente' })
  estado: PagoEstado;

  @Column({ name: 'token_transbank', length: 255, nullable: true })
  tokenTransbank: string | null;

  @Column({ name: 'referencia_transbank', length: 255, nullable: true })
  referenciaTransbank: string | null;

  @Column({ name: 'pagado_en', type: 'timestamp with time zone', nullable: true })
  pagadoEn: Date | null;

  @Column({ name: 'es_parcial', default: false })
  esParcial: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Reserva, (reserva) => reserva.pago)
  @JoinColumn({ name: 'reserva_id' })
  reserva: Reserva;

  @OneToOne(() => Devolucion, (devolucion) => devolucion.pago)
  devolucion: Devolucion | null;
}

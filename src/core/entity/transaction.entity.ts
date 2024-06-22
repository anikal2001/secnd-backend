import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BaseEntity } from 'typeorm';
import { User } from './user.model';

export enum TransactionType {
  DEPOSIT = 'deposit',
  PAYMENT = 'payment',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity()
export class Transaction extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: number;

  @ManyToOne(() => User, (user: { transactions: Transaction }) => user.transactions)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.DEPOSIT,
  })
  type!: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status!: TransactionStatus;

  @Column('timestamp')
  transactionDate!: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
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
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.client)
  @JoinColumn({
    name: 'user_id',
  })
  client: User;


}

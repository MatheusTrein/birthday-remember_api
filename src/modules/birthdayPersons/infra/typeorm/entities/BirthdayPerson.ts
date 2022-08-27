import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { User } from "@modules/accounts/infra/typeorm/entities/User";

@Entity("birthday_persons")
class BirthdayPerson {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ name: "birth_date" })
  birthDate: Date;

  @Column({ name: "alarm_time" })
  alarmTime: string;

  @Column({ name: "reminder_is_active" })
  reminderIsActive: boolean;

  @Column({ name: "user_id" })
  userId: string;

  @Column({ name: "created_at" })
  createdAt: Date;

  // Relations

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;
}

export { BirthdayPerson };

import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("refresh_tokens")
class RefreshToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  ip: string;
  @Column({ name: "is_mobile" })
  isMobile: boolean;

  @Column({ name: "user_id" })
  userId: string;

  @Column({ name: "expires_in" })
  expiresIn: Date;

  @Column({ name: "created_at" })
  createdAt: Date;
}

export { RefreshToken };

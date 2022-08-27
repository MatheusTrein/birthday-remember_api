import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("user_tokens")
class UserToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  token: string;

  @Column()
  type: string;

  @Column({ name: "user_id" })
  userId: string;

  @Column({ name: "expires_in" })
  expiresIn: Date;
}

export { UserToken };

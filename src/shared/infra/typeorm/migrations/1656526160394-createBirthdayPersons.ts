import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class createBirthdayPersons1656526160394 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "birthday_persons",
        columns: [
          {
            name: "id",
            type: "uuid",
            default: "uuid_generate_v4()",
            isGenerated: true,
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "birth_date",
            type: "timestamp",
            isNullable: false,
          },
          {
            name: "reminder_is_active",
            type: "boolean",
            isNullable: false,
            default: true,
          },
          {
            name: "alarm_time",
            type: "time",
            isNullable: false,
          },
          {
            name: "user_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            isNullable: false,
            default: "now()",
          },
        ],
        foreignKeys: [
          {
            name: "FKBirthdayPersonsUsers",
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            columnNames: ["user_id"],
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("birthday_persons");
  }
}

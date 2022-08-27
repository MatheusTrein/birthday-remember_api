import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterTableRefreshTokenAddIsMobileColumn1660583058044
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "refresh_tokens",
      new TableColumn({
        name: "is_mobile",
        type: "boolean",
        isNullable: false,
        default: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("refresh_tokens", "is_mobile");
  }
}

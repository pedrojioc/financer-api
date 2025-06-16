import { MigrationInterface, QueryRunner } from 'typeorm'

export class DeleteUnusedTables1750114370399 implements MigrationInterface {
  name = 'DeleteUnusedTables1750114370399'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`daily_interest\``)
    await queryRunner.query(`DROP TABLE \`payment_periods\``)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}

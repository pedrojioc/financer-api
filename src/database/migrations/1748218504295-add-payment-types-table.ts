import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPaymentTypesTable1748218504295 implements MigrationInterface {
  name = 'AddPaymentTypesTable1748218504295'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`payment_types\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    )
    await queryRunner.manager.insert('payment_types', [
      { name: 'Cuota normal', description: 'Pago de cuota' },
      { name: 'Abono a capital', description: 'Pago a capital' },
      { name: 'Mora', description: 'Pago de mora' },
      { name: 'Otros', description: 'Otros tipos de pago' },
    ])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`payment_types\``)
  }
}

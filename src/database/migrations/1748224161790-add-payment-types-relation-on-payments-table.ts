import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentTypesRelationOnPaymentsTable1748224161790 implements MigrationInterface {
    name = 'AddPaymentTypesRelationOnPaymentsTable1748224161790'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payments\` ADD \`payment_type_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`payments\` ADD CONSTRAINT \`FK_650ff857451d1502709df53d485\` FOREIGN KEY (\`payment_type_id\`) REFERENCES \`payment_types\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_650ff857451d1502709df53d485\``);
        await queryRunner.query(`ALTER TABLE \`payments\` DROP COLUMN \`payment_type_id\``);
    }

}

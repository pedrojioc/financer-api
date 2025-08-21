import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldsToInstallmentsTable1753984376177 implements MigrationInterface {
    name = 'AddFieldsToInstallmentsTable1753984376177'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`installments\` ADD \`capital_paid\` decimal(15,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`installments\` ADD \`total_paid\` decimal(15,2) NOT NULL DEFAULT '0.00'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`installments\` DROP COLUMN \`total_paid\``);
        await queryRunner.query(`ALTER TABLE \`installments\` DROP COLUMN \`capital_paid\``);
    }

}

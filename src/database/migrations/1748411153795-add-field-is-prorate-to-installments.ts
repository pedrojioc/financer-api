import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldIsProrateToInstallments1748411153795 implements MigrationInterface {
    name = 'AddFieldIsProrateToInstallments1748411153795'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`installments\` ADD \`is_prorate\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`installments\` DROP COLUMN \`is_prorate\``);
    }

}

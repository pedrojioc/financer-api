import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldFlowTypeToTransactions1750283826830 implements MigrationInterface {
    name = 'AddFieldFlowTypeToTransactions1750283826830'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD \`flow_type\` enum ('INFLOW', 'OUTFLOW') NOT NULL COMMENT 'Direction of the transaction'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`flow_type\``);
    }

}

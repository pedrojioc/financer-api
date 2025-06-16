import { MigrationInterface, QueryRunner } from "typeorm";

export class DeletePaymentPeriodRelation1750035158391 implements MigrationInterface {
    name = 'DeletePaymentPeriodRelation1750035158391'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`loans\` DROP FOREIGN KEY \`FK_e43956f9a98549aa2bc5d95cddb\``);
        await queryRunner.query(`ALTER TABLE \`loans\` DROP COLUMN \`payment_period_id\``);
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`loans\` ADD \`payment_period_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`loans\` ADD CONSTRAINT \`FK_e43956f9a98549aa2bc5d95cddb\` FOREIGN KEY (\`payment_period_id\`) REFERENCES \`payment_periods\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class SetPaymentDayToNotNull1748065797891 implements MigrationInterface {
    name = 'SetPaymentDayToNotNull1748065797891'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`loans\` CHANGE \`payment_day\` \`payment_day\` int NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`loans\` CHANGE \`payment_day\` \`payment_day\` int NULL`);
    }

}

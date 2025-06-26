import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLoanSnapshots1750906777301 implements MigrationInterface {
    name = 'AddLoanSnapshots1750906777301'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`loan_balance_snapshots\` (\`id\` int NOT NULL AUTO_INCREMENT, \`loan_id\` int NOT NULL, \`debt\` decimal(15,2) NOT NULL, \`overdue_interest\` decimal(15,2) NOT NULL, \`interest_rate\` decimal(15,2) NOT NULL, \`snapshot_date\` date NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`loan_balance_snapshots\` ADD CONSTRAINT \`FK_62362fe9d7ac581a28ee18fa31e\` FOREIGN KEY (\`loan_id\`) REFERENCES \`loans\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`loan_balance_snapshots\` DROP FOREIGN KEY \`FK_62362fe9d7ac581a28ee18fa31e\``);
        await queryRunner.query(`DROP TABLE \`loan_balance_snapshots\``);
    }

}

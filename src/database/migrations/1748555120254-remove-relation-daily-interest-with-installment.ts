import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveRelationDailyInterestWithInstallment1748555120254 implements MigrationInterface {
    name = 'RemoveRelationDailyInterestWithInstallment1748555120254'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`daily_interest\` DROP FOREIGN KEY \`FK_932f7c72d7e10339ffdf3ca589e\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`daily_interest\` ADD CONSTRAINT \`FK_932f7c72d7e10339ffdf3ca589e\` FOREIGN KEY (\`installment_id\`) REFERENCES \`installments\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}

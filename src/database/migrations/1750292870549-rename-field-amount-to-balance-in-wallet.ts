import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameFieldAmountToBalanceInWallet1750292870549 implements MigrationInterface {
    name = 'RenameFieldAmountToBalanceInWallet1750292870549'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`wallets\` CHANGE \`amount\` \`balance\` decimal(15,2) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`wallets\` CHANGE \`balance\` \`amount\` decimal(15,2) NOT NULL`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWalletAndTransactionsFeature1749942073855 implements MigrationInterface {
    name = 'AddWalletAndTransactionsFeature1749942073855'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`wallets\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`amount\` decimal(15,2) NOT NULL, \`description\` varchar(255) NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`transaction_types\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`transactions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`transaction_type_id\` int NOT NULL, \`wallet_id\` int NOT NULL, \`loan_id\` int NULL, \`description\` varchar(255) NOT NULL, \`amount\` decimal(15,2) NOT NULL, \`previous_balance\` decimal(15,2) NOT NULL, \`new_balance\` decimal(15,2) NOT NULL, \`date\` date NOT NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD CONSTRAINT \`FK_0088fd11d7d79f73d8824a10fcc\` FOREIGN KEY (\`transaction_type_id\`) REFERENCES \`transaction_types\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD CONSTRAINT \`FK_0b171330be0cb621f8d73b87a9e\` FOREIGN KEY (\`wallet_id\`) REFERENCES \`wallets\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD CONSTRAINT \`FK_5101fa7a2a4dce364c002f9fad4\` FOREIGN KEY (\`loan_id\`) REFERENCES \`loans\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);

        await queryRunner.manager.insert('wallets', [{ name: 'Capital', amount: 0, description: 'Capital' }])
        await queryRunner.manager.insert('transaction_types', [{ name: 'Desembolso', description: 'Desembolso' }, { name: 'Pago a capital', description: 'Pago a capital' }, { name: 'Inyección de liquidez', description: 'Inyección de liquidez' }, { name: 'Reembolso', description: 'Reembolso' }])
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_5101fa7a2a4dce364c002f9fad4\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_0b171330be0cb621f8d73b87a9e\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_0088fd11d7d79f73d8824a10fcc\``);
        await queryRunner.query(`DROP TABLE \`transactions\``);
        await queryRunner.query(`DROP TABLE \`transaction_types\``);
        await queryRunner.query(`DROP TABLE \`wallets\``);
    }

}

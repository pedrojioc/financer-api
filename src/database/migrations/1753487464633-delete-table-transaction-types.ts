import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteTableTransactionTypes1753487464633 implements MigrationInterface {
    name = 'DeleteTableTransactionTypes1753487464633'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_0088fd11d7d79f73d8824a10fcc\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`transaction_type_id\``);
        await queryRunner.query(`DROP TABLE \`transaction_types\``)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD \`transaction_type_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD CONSTRAINT \`FK_0088fd11d7d79f73d8824a10fcc\` FOREIGN KEY (\`transaction_type_id\`) REFERENCES \`transaction_types\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE TABLE \`transaction_types\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`);
    }

}

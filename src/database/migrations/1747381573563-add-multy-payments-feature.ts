import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMultyPaymentsFeature1747381573563 implements MigrationInterface {
    name = 'AddMultyPaymentsFeature1747381573563'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`commissions_installments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`amount\` decimal(12,2) NOT NULL, \`commission_id\` int NULL, \`installment_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`commissions\` ADD \`payment_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`commissions\` ADD CONSTRAINT \`FK_b57b1306fdd71690cd88300b7bb\` FOREIGN KEY (\`payment_id\`) REFERENCES \`payments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`commissions_installments\` ADD CONSTRAINT \`FK_4f3e9b291637b09486729c531a5\` FOREIGN KEY (\`commission_id\`) REFERENCES \`commissions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`commissions_installments\` ADD CONSTRAINT \`FK_1b69014ea871b146b4d44e45f45\` FOREIGN KEY (\`installment_id\`) REFERENCES \`installments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`commissions_installments\` DROP FOREIGN KEY \`FK_1b69014ea871b146b4d44e45f45\``);
        await queryRunner.query(`ALTER TABLE \`commissions_installments\` DROP FOREIGN KEY \`FK_4f3e9b291637b09486729c531a5\``);
        await queryRunner.query(`ALTER TABLE \`commissions\` DROP FOREIGN KEY \`FK_b57b1306fdd71690cd88300b7bb\``);
        await queryRunner.query(`ALTER TABLE \`commissions\` DROP COLUMN \`payment_id\``);
        await queryRunner.query(`DROP TABLE \`commissions_installments\``);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteInstallmentFieldFromCommissions1747867076173 implements MigrationInterface {
    name = 'DeleteInstallmentFieldFromCommissions1747867076173'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`commissions\` DROP FOREIGN KEY \`FK_7faaaed94b7423d43a24e27b938\``);
        await queryRunner.query(`DROP INDEX \`REL_7faaaed94b7423d43a24e27b93\` ON \`commissions\``);
        await queryRunner.query(`ALTER TABLE \`commissions\` DROP COLUMN \`installment_id\``);
        await queryRunner.query(`ALTER TABLE \`commissions\` DROP FOREIGN KEY \`FK_b57b1306fdd71690cd88300b7bb\``);
        await queryRunner.query(`ALTER TABLE \`commissions\` CHANGE \`payment_id\` \`payment_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`commissions_installments\` DROP FOREIGN KEY \`FK_4f3e9b291637b09486729c531a5\``);
        await queryRunner.query(`ALTER TABLE \`commissions_installments\` DROP FOREIGN KEY \`FK_1b69014ea871b146b4d44e45f45\``);
        await queryRunner.query(`ALTER TABLE \`commissions_installments\` CHANGE \`commission_id\` \`commission_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`commissions_installments\` CHANGE \`installment_id\` \`installment_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`commissions\` ADD CONSTRAINT \`FK_b57b1306fdd71690cd88300b7bb\` FOREIGN KEY (\`payment_id\`) REFERENCES \`payments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`commissions_installments\` ADD CONSTRAINT \`FK_4f3e9b291637b09486729c531a5\` FOREIGN KEY (\`commission_id\`) REFERENCES \`commissions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`commissions_installments\` ADD CONSTRAINT \`FK_1b69014ea871b146b4d44e45f45\` FOREIGN KEY (\`installment_id\`) REFERENCES \`installments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`commissions_installments\` DROP FOREIGN KEY \`FK_1b69014ea871b146b4d44e45f45\``);
        await queryRunner.query(`ALTER TABLE \`commissions_installments\` DROP FOREIGN KEY \`FK_4f3e9b291637b09486729c531a5\``);
        await queryRunner.query(`ALTER TABLE \`commissions\` DROP FOREIGN KEY \`FK_b57b1306fdd71690cd88300b7bb\``);
        await queryRunner.query(`ALTER TABLE \`commissions_installments\` CHANGE \`installment_id\` \`installment_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`commissions_installments\` CHANGE \`commission_id\` \`commission_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`commissions_installments\` ADD CONSTRAINT \`FK_1b69014ea871b146b4d44e45f45\` FOREIGN KEY (\`installment_id\`) REFERENCES \`installments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`commissions_installments\` ADD CONSTRAINT \`FK_4f3e9b291637b09486729c531a5\` FOREIGN KEY (\`commission_id\`) REFERENCES \`commissions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`commissions\` CHANGE \`payment_id\` \`payment_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`commissions\` ADD CONSTRAINT \`FK_b57b1306fdd71690cd88300b7bb\` FOREIGN KEY (\`payment_id\`) REFERENCES \`payments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`commissions\` ADD \`installment_id\` int NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_7faaaed94b7423d43a24e27b93\` ON \`commissions\` (\`installment_id\`)`);
        await queryRunner.query(`ALTER TABLE \`commissions\` ADD CONSTRAINT \`FK_7faaaed94b7423d43a24e27b938\` FOREIGN KEY (\`installment_id\`) REFERENCES \`installments\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}

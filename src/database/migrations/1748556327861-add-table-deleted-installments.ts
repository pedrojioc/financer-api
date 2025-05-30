import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTableDeletedInstallments1748556327861 implements MigrationInterface {
    name = 'AddTableDeletedInstallments1748556327861'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`FK_932f7c72d7e10339ffdf3ca589e\` ON \`daily_interest\``);
        await queryRunner.query(`CREATE TABLE \`deleted_installments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`installment_id\` int NOT NULL, \`user_id\` int NOT NULL COMMENT 'Usuario que elimino el registro', \`loan_id\` int NOT NULL, \`installment_state_id\` int NOT NULL, \`debt\` decimal(15,2) NOT NULL, \`starts_on\` date NULL, \`payment_deadline\` date NULL, \`days\` int NOT NULL DEFAULT '0', \`installment_number\` int NOT NULL DEFAULT '0', \`capital\` decimal(15,2) NOT NULL COMMENT 'Abono que se hace a la deuda capital' DEFAULT '0.00', \`interest\` decimal(15,2) NOT NULL, \`interest_piad\` decimal(15,2) NOT NULL COMMENT 'Pago realizado a intereses' DEFAULT '0.00', \`total\` decimal(15,2) NOT NULL, \`is_prorate\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`deleted_installments\` ADD CONSTRAINT \`FK_1d4438fffe3f430563093cb67a3\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`deleted_installments\` ADD CONSTRAINT \`FK_57df54d40fbcff4da4fe4e407da\` FOREIGN KEY (\`loan_id\`) REFERENCES \`loans\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`deleted_installments\` DROP FOREIGN KEY \`FK_57df54d40fbcff4da4fe4e407da\``);
        await queryRunner.query(`ALTER TABLE \`deleted_installments\` DROP FOREIGN KEY \`FK_1d4438fffe3f430563093cb67a3\``);
        await queryRunner.query(`DROP TABLE \`deleted_installments\``);
        await queryRunner.query(`CREATE INDEX \`FK_932f7c72d7e10339ffdf3ca589e\` ON \`daily_interest\` (\`installment_id\`)`);
    }

}

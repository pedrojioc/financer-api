import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldsToCustomersTable1749064039538 implements MigrationInterface {
    name = 'AddFieldsToCustomersTable1749064039538'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`customers\` ADD \`personal_reference\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`customers\` ADD \`personal_reference_phone\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`customers\` ADD \`work_reference\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`customers\` ADD \`work_reference_phone\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`customers\` CHANGE \`birthdate\` \`birthdate\` date NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`customers\` CHANGE \`birthdate\` \`birthdate\` date NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`customers\` DROP COLUMN \`work_reference_phone\``);
        await queryRunner.query(`ALTER TABLE \`customers\` DROP COLUMN \`work_reference\``);
        await queryRunner.query(`ALTER TABLE \`customers\` DROP COLUMN \`personal_reference_phone\``);
        await queryRunner.query(`ALTER TABLE \`customers\` DROP COLUMN \`personal_reference\``);
    }

}

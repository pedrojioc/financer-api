import { MigrationInterface, QueryRunner } from "typeorm";

export class SetGenderFieldToNotNull1750788050897 implements MigrationInterface {
    name = 'SetGenderFieldToNotNull1750788050897'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`customers\` DROP FOREIGN KEY \`FK_72aeaee1e3581b1e027d2697bd7\``);
        await queryRunner.query(`ALTER TABLE \`customers\` CHANGE \`gender_id\` \`gender_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`customers\` ADD CONSTRAINT \`FK_72aeaee1e3581b1e027d2697bd7\` FOREIGN KEY (\`gender_id\`) REFERENCES \`genders\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`customers\` DROP FOREIGN KEY \`FK_72aeaee1e3581b1e027d2697bd7\``);
        await queryRunner.query(`ALTER TABLE \`customers\` CHANGE \`gender_id\` \`gender_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`customers\` ADD CONSTRAINT \`FK_72aeaee1e3581b1e027d2697bd7\` FOREIGN KEY (\`gender_id\`) REFERENCES \`genders\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}

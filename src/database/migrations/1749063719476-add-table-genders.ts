import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTableGenders1749063719476 implements MigrationInterface {
  name = 'AddTableGenders1749063719476'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`genders\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    )
    await queryRunner.query(`ALTER TABLE \`customers\` ADD \`gender_id\` int NULL`)
    await queryRunner.query(
      `ALTER TABLE \`customers\` ADD CONSTRAINT \`FK_72aeaee1e3581b1e027d2697bd7\` FOREIGN KEY (\`gender_id\`) REFERENCES \`genders\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )

    await queryRunner.manager.insert('genders', [{ name: 'Masculino' }, { name: 'Femenino' }])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`customers\` DROP FOREIGN KEY \`FK_72aeaee1e3581b1e027d2697bd7\``,
    )
    await queryRunner.query(`ALTER TABLE \`customers\` DROP COLUMN \`gender_id\``)
    await queryRunner.query(`DROP TABLE \`genders\``)
  }
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTableTransactionCategories1753316890557 implements MigrationInterface {
    name = 'AddTableTransactionCategories1753316890557'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`transaction_categories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`icon\` varchar(255) NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`wallet_transaction_categories\` (\`wallet_id\` int NOT NULL, \`transaction_category_id\` int NOT NULL, INDEX \`IDX_871286d4a7e41488e187f83793\` (\`wallet_id\`), INDEX \`IDX_f4b48a8994421884bb57056c54\` (\`transaction_category_id\`), PRIMARY KEY (\`wallet_id\`, \`transaction_category_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD \`transaction_category_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD CONSTRAINT \`FK_12f33e8e7d92b6030c3f64fb2bd\` FOREIGN KEY (\`transaction_category_id\`) REFERENCES \`transaction_categories\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`wallet_transaction_categories\` ADD CONSTRAINT \`FK_871286d4a7e41488e187f837939\` FOREIGN KEY (\`wallet_id\`) REFERENCES \`wallets\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`wallet_transaction_categories\` ADD CONSTRAINT \`FK_f4b48a8994421884bb57056c542\` FOREIGN KEY (\`transaction_category_id\`) REFERENCES \`transaction_categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await queryRunner.manager.insert('transaction_categories', [
            { name: 'Desembolso', description: 'Desembolso' },
            { name: 'Pago a capital', description: 'Pago a capital' },
            { name: 'Inyección de liquidez', description: 'Inyección de liquidez' },
            { name: 'Reembolso', description: 'Reembolso' },
            { name: 'Servicios', description: 'Servicios' },
            { name: 'Comida', description: 'Comida' },
            { name: 'Transporte', description: 'Transporte' },
            { name: 'Entretenimiento', description: 'Entretenimiento' },
            { name: 'Salud', description: 'Salud' },
            { name: 'Intereses', description: 'Intereses' },            
            { name: 'Otros', description: 'Otros' },
          ])
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`wallet_transaction_categories\` DROP FOREIGN KEY \`FK_f4b48a8994421884bb57056c542\``);
        await queryRunner.query(`ALTER TABLE \`wallet_transaction_categories\` DROP FOREIGN KEY \`FK_871286d4a7e41488e187f837939\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_12f33e8e7d92b6030c3f64fb2bd\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`transaction_category_id\``);
        await queryRunner.query(`DROP INDEX \`IDX_f4b48a8994421884bb57056c54\` ON \`wallet_transaction_categories\``);
        await queryRunner.query(`DROP INDEX \`IDX_871286d4a7e41488e187f83793\` ON \`wallet_transaction_categories\``);
        await queryRunner.query(`DROP TABLE \`wallet_transaction_categories\``);
        await queryRunner.query(`DROP TABLE \`transaction_categories\``);
    }

}

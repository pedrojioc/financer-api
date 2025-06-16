import * as dotenv from 'dotenv'
import { DataSource } from 'typeorm'

dotenv.config()

let entitiesPath = 'src/**/*.entity.ts'
let migrationsPath = 'src/database/migrations/*.ts'

if (process.env.NODE_ENV === 'production') {
  entitiesPath = 'dist/src/**/*.entity.js'
  migrationsPath = 'dist/src/database/migrations/*.js'
}

export const AppDataSource = new DataSource({
  type: 'mysql',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: true,
  entities: [entitiesPath],
  migrations: [migrationsPath],
  migrationsTableName: 'migrations',
})

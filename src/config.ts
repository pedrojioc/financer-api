import { registerAs } from '@nestjs/config'
import * as handlebars from 'handlebars'

export default registerAs('config', () => ({
  mysql: {
    type: 'mysql',
    port: Number(process.env.DATABASE_PORT),
    host: process.env.DATABASE_HOST,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
  postgresql: {
    type: 'postgresql',
  },
  jwtSecret: process.env.JWT_SECRET,
  KEY: 'asd',
  whatsAppToken: process.env.WHATSAPP_TOKEN,
}))

export function registerHandlebarsHelpers() {
  handlebars.registerHelper(
    'formatDate',
    (date: Date, format: 'full' | 'long' | 'medium' | 'short') => {
      return new Intl.DateTimeFormat('en-US', { dateStyle: format }).format(date)
    },
  )

  handlebars.registerHelper('isEqual', (arg1: any, arg2: any) => {
    return arg1 === arg2
  })

  handlebars.registerHelper('toUpperCase', (str: string) => {
    return str.toUpperCase()
  })
}

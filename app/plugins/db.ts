import { appDataDir } from '@tauri-apps/api/path'
import Database from '@tauri-apps/plugin-sql'
import { Kysely } from 'kysely'
import { TauriSqliteDialect } from 'kysely-dialect-tauri'

export default defineNuxtPlugin(async () => {
  const db = new Kysely<DB>({
    dialect: new TauriSqliteDialect({
      database: async prefix => Database.load(`${prefix}${await appDataDir()}/swim.db`),
    }),
  })

  return {
    provide: {
      db,
    },
  }
})

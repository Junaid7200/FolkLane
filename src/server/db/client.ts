import fs from 'node:fs'
import path from 'node:path'
import BetterSqlite3 from 'better-sqlite3'
import { serverConfig } from '../config/env'

let db: BetterSqlite3.Database | null = null
let initialized = false

function resolveSqlitePath() {
  return path.resolve(process.cwd(), serverConfig.sqliteFile)
}

function isNetlifyRuntime() {
  return Boolean(process.env.NETLIFY)
}

function ensureDbDirectory(filePath: string) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function ensureNetlifyRuntimeSnapshot(targetPath: string) {
  if (!isNetlifyRuntime()) return

  const normalizedTargetPath = path.resolve(targetPath)
  const tmpRoot = path.resolve('/tmp')
  const isTmpTarget =
    normalizedTargetPath === tmpRoot ||
    normalizedTargetPath.startsWith(`${tmpRoot}${path.sep}`)
  if (!isTmpTarget) return
  if (fs.existsSync(normalizedTargetPath)) return

  const bundledSnapshotPath = path.resolve(
    process.cwd(),
    'data',
    'folklane.sqlite',
  )
  if (!fs.existsSync(bundledSnapshotPath)) return

  ensureDbDirectory(normalizedTargetPath)
  fs.copyFileSync(bundledSnapshotPath, normalizedTargetPath)
}

export function getDatabase(): BetterSqlite3.Database {
  if (db) return db

  const filePath = resolveSqlitePath()
  ensureNetlifyRuntimeSnapshot(filePath)
  ensureDbDirectory(filePath)

  db = new BetterSqlite3(filePath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  initialized = true

  return db
}

export type DatabaseClientState = {
  provider: 'sqlite'
  file: string
  ready: boolean
}

export function getDatabaseClientState(): DatabaseClientState {
  return {
    provider: 'sqlite',
    file: resolveSqlitePath(),
    ready: initialized,
  }
}

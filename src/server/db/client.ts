import { serverConfig } from '../config/env'

export type DatabaseClientState = {
  provider: 'sqlite'
  file: string
  ready: false
}

// Checkpoint 0 stub: concrete DB connection is introduced in Checkpoint 2.
export function getDatabaseClientState(): DatabaseClientState {
  return {
    provider: 'sqlite',
    file: serverConfig.sqliteFile,
    ready: false,
  }
}


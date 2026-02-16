type ServerConfig = {
  nodeEnv: string
  sqliteFile: string
  redisUrl: string
}

export const serverConfig: ServerConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  sqliteFile: process.env.SQLITE_FILE || './data/folklane.sqlite',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
}


type ServerConfig = {
  nodeEnv: string
  sqliteFile: string
  redisUrl: string
  scrapeMaxProducts: number
  scrapeMaxPages: number
  scrapeSchedulePattern: string
}

export const serverConfig: ServerConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  sqliteFile: process.env.SQLITE_FILE || './data/folklane.sqlite',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  scrapeMaxProducts: Number.parseInt(process.env.SCRAPE_MAX_PRODUCTS || '100', 10),
  scrapeMaxPages: Number.parseInt(process.env.SCRAPE_MAX_PAGES || '20', 10),
  scrapeSchedulePattern: process.env.SCRAPE_SCHEDULE_PATTERN || '0 */12 * * *',
}

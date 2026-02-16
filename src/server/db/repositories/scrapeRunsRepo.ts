import type BetterSqlite3 from 'better-sqlite3'
import type { ScrapeRunRow, ScrapeRunStatus } from '../schema'

type ScrapeRunRecord = {
  id: string
  brand_id: string
  triggered_by: 'manual' | 'schedule'
  queue_job_id: string | null
  status: ScrapeRunStatus
  attempts: number
  max_attempts: number
  started_at: string | null
  finished_at: string | null
  items_found: number | null
  error_message: string | null
}

function mapScrapeRun(record: ScrapeRunRecord): ScrapeRunRow {
  return {
    id: record.id,
    brandId: record.brand_id,
    triggeredBy: record.triggered_by,
    queueJobId: record.queue_job_id,
    status: record.status,
    attempts: record.attempts,
    maxAttempts: record.max_attempts,
    startedAt: record.started_at,
    finishedAt: record.finished_at,
    itemsFound: record.items_found,
    errorMessage: record.error_message,
  }
}

export function createQueuedScrapeRun(
  db: BetterSqlite3.Database,
  input: {
    id: string
    brandId: string
    triggeredBy: 'manual' | 'schedule'
    queueJobId: string | null
    maxAttempts: number
  },
) {
  db.prepare(
    `INSERT INTO scrape_runs (
      id, brand_id, triggered_by, queue_job_id, status, attempts, max_attempts, started_at, finished_at, items_found, error_message
    ) VALUES (?, ?, ?, ?, 'queued', 0, ?, NULL, NULL, NULL, NULL)`,
  ).run(
    input.id,
    input.brandId,
    input.triggeredBy,
    input.queueJobId,
    input.maxAttempts,
  )
}

export function setScrapeRunQueueJobId(
  db: BetterSqlite3.Database,
  input: { id: string; queueJobId: string | null },
) {
  db.prepare(`UPDATE scrape_runs SET queue_job_id = ? WHERE id = ?`).run(
    input.queueJobId,
    input.id,
  )
}

export function markScrapeRunRunning(
  db: BetterSqlite3.Database,
  input: { id: string; startedAt: string; attempts: number },
) {
  db.prepare(
    `UPDATE scrape_runs
     SET status = 'running', started_at = ?, attempts = ?, error_message = NULL
     WHERE id = ?`,
  ).run(input.startedAt, input.attempts, input.id)
}

export function markScrapeRunSuccess(
  db: BetterSqlite3.Database,
  input: { id: string; finishedAt: string; itemsFound: number },
) {
  db.prepare(
    `UPDATE scrape_runs
     SET status = 'success', finished_at = ?, items_found = ?, error_message = NULL
     WHERE id = ?`,
  ).run(input.finishedAt, input.itemsFound, input.id)
}

export function markScrapeRunFailed(
  db: BetterSqlite3.Database,
  input: {
    id: string
    finishedAt: string
    errorMessage: string
    attempts: number
  },
) {
  db.prepare(
    `UPDATE scrape_runs
     SET status = 'failed', finished_at = ?, attempts = ?, error_message = ?
     WHERE id = ?`,
  ).run(input.finishedAt, input.attempts, input.errorMessage, input.id)
}

export function listRecentScrapeRuns(
  db: BetterSqlite3.Database,
  options?: {
    limit?: number
    status?: ScrapeRunStatus
    brandId?: string
  },
): ScrapeRunRow[] {
  const limit = options?.limit ?? 20
  const whereParts: string[] = []
  const params: unknown[] = []

  if (options?.status) {
    whereParts.push(`status = ?`)
    params.push(options.status)
  }

  if (options?.brandId) {
    whereParts.push(`brand_id = ?`)
    params.push(options.brandId)
  }

  const whereClause =
    whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : ''

  const rows = db
    .prepare(
      `SELECT id, brand_id, triggered_by, queue_job_id, status, attempts, max_attempts, started_at, finished_at, items_found, error_message
       FROM scrape_runs
       ${whereClause}
       ORDER BY rowid DESC
       LIMIT ?`,
    )
    .all(...params, limit) as ScrapeRunRecord[]

  return rows.map(mapScrapeRun)
}

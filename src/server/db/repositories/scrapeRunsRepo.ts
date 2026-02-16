import type BetterSqlite3 from 'better-sqlite3'
import type { ScrapeRunRow, ScrapeRunStatus } from '../schema'

type ScrapeRunRecord = {
  id: string
  brand_id: string
  status: ScrapeRunStatus
  started_at: string | null
  finished_at: string | null
  items_found: number | null
  error_message: string | null
}

function mapScrapeRun(record: ScrapeRunRecord): ScrapeRunRow {
  return {
    id: record.id,
    brandId: record.brand_id,
    status: record.status,
    startedAt: record.started_at,
    finishedAt: record.finished_at,
    itemsFound: record.items_found,
    errorMessage: record.error_message,
  }
}

export function createQueuedScrapeRun(
  db: BetterSqlite3.Database,
  input: { id: string; brandId: string },
) {
  db.prepare(
    `INSERT INTO scrape_runs (
      id, brand_id, status, started_at, finished_at, items_found, error_message
    ) VALUES (?, ?, 'queued', NULL, NULL, NULL, NULL)`,
  ).run(input.id, input.brandId)
}

export function markScrapeRunRunning(
  db: BetterSqlite3.Database,
  input: { id: string; startedAt: string },
) {
  db.prepare(
    `UPDATE scrape_runs
     SET status = 'running', started_at = ?, error_message = NULL
     WHERE id = ?`,
  ).run(input.startedAt, input.id)
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
  input: { id: string; finishedAt: string; errorMessage: string },
) {
  db.prepare(
    `UPDATE scrape_runs
     SET status = 'failed', finished_at = ?, error_message = ?
     WHERE id = ?`,
  ).run(input.finishedAt, input.errorMessage, input.id)
}

export function listRecentScrapeRuns(
  db: BetterSqlite3.Database,
  limit = 20,
): ScrapeRunRow[] {
  const rows = db
    .prepare(
      `SELECT id, brand_id, status, started_at, finished_at, items_found, error_message
       FROM scrape_runs
       ORDER BY rowid DESC
       LIMIT ?`,
    )
    .all(limit) as ScrapeRunRecord[]

  return rows.map(mapScrapeRun)
}


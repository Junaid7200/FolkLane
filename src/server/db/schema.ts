export type CategoryId = 'luxury' | 'casual' | 'cheap'

export type BrandRow = {
  id: string
  name: string
  category: CategoryId // Legacy field, kept for compatibility
  categories: CategoryId[]
  description: string | null
  createdAt: string
  updatedAt: string
}

export type ProductRow = {
  id: string
  brandId: string
  title: string
  description: string
  price: number
  image: string
  images: string[]
  sourceUrl: string | null
  lastScrapedAt: string | null
  createdAt: string
  updatedAt: string
}

export type ScrapeRunStatus = 'queued' | 'running' | 'success' | 'failed'

export type ScrapeRunRow = {
  id: string
  brandId: string
  triggeredBy: 'manual' | 'schedule'
  queueJobId: string | null
  status: ScrapeRunStatus
  attempts: number
  maxAttempts: number
  startedAt: string | null
  finishedAt: string | null
  itemsFound: number | null
  errorMessage: string | null
}

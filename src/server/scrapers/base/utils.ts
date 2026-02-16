const REQUEST_TIMEOUT_MS = 15000

export async function fetchText(url: string): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (compatible; FolkLaneScraper/1.0; +https://folklane.local)',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`)
    }

    return await response.text()
  } finally {
    clearTimeout(timeout)
  }
}

export function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

export function parsePriceToRupees(value: string): number | null {
  const cleaned = value.replace(/[^\d.,]/g, '')
  if (!cleaned) return null

  const normalized = cleaned.includes('.')
    ? cleaned.replace(/,/g, '')
    : cleaned.replace(/,/g, '')

  const parsed = Number.parseFloat(normalized)
  if (Number.isNaN(parsed) || parsed <= 0) return null
  return Math.round(parsed)
}

export function absoluteUrl(baseUrl: string, href: string): string {
  return new URL(href, baseUrl).toString()
}

export function dedupeStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter((item) => item.length > 0)))
}

export function safeProductId(brandId: string, handle: string) {
  const cleaned = handle
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return `${brandId}-${cleaned}`
}

export function productHandleFromUrl(urlString: string): string | null {
  try {
    const url = new URL(urlString)
    const match = url.pathname.match(/\/products\/([^/?#]+)/)
    return match?.[1] ?? null
  } catch {
    return null
  }
}


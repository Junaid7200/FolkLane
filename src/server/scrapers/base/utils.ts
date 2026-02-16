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

export async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (compatible; FolkLaneScraper/1.0; +https://folklane.local)',
        accept: 'application/json,text/plain;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`)
    }

    return (await response.json()) as T
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

function canonicalShopifyImagePath(pathname: string) {
  // Shopify image variants often differ only by size suffixes like `_1200x1200` or `_720x`.
  return pathname.replace(/_(\d+x\d+|\d+x|x\d+)(?=\.[a-z0-9]+$)/i, '')
}

function imageDedupeKey(urlValue: string): string {
  try {
    const normalized = new URL(urlValue.startsWith('//') ? `https:${urlValue}` : urlValue)
    const host = normalized.hostname.toLowerCase()
    const path = canonicalShopifyImagePath(normalized.pathname)
    return `${host}${path}`
  } catch {
    return urlValue.trim()
  }
}

export function dedupeImageUrls(values: string[]): string[] {
  const seen = new Set<string>()
  const deduped: string[] = []

  for (const raw of values) {
    const value = raw.trim()
    if (!value) continue
    const key = imageDedupeKey(value)
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(value)
  }

  return deduped
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

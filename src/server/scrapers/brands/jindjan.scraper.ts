import { load } from 'cheerio'
import type { BrandScrapeResult, ScrapeOptions, ScrapedProduct } from '../base/types'
import {
  absoluteUrl,
  dedupeStrings,
  fetchText,
  normalizeWhitespace,
  parsePriceToRupees,
  productHandleFromUrl,
  safeProductId,
} from '../base/utils'

const BRAND_ID = 'jindjan'
const BASE_URL = 'https://jindjan.com'
const COLLECTION_URL = `${BASE_URL}/collections/frontpage`

function getListingPageUrl(page: number) {
  const url = new URL(COLLECTION_URL)
  url.searchParams.set('page', String(page))
  return url.toString()
}

function normalizeProductUrl(href: string): string | null {
  try {
    const absolute = new URL(href, BASE_URL)
    const handle = productHandleFromUrl(absolute.toString())
    if (!handle) return null

    absolute.pathname = `/products/${handle}`
    absolute.search = ''
    absolute.hash = ''
    return absolute.toString()
  } catch {
    return null
  }
}

function extractProductUrlsFromListing(html: string): string[] {
  const $ = load(html)
  const urls: string[] = []

  $('a[href*="/products/"]').each((_, element) => {
    const href = $(element).attr('href')
    if (!href) return
    const normalized = normalizeProductUrl(href)
    if (normalized) urls.push(normalized)
  })

  return dedupeStrings(urls)
}

function parseJsonLdProductImages($: ReturnType<typeof load>): string[] {
  const collected: string[] = []

  $('script[type="application/ld+json"]').each((_, element) => {
    const raw = $(element).html()
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as unknown
      const blocks = Array.isArray(parsed) ? parsed : [parsed]

      for (const block of blocks) {
        if (!block || typeof block !== 'object') continue
        const obj = block as Record<string, unknown>
        const typeValue = obj['@type']
        const isProduct =
          typeValue === 'Product' ||
          (Array.isArray(typeValue) && typeValue.includes('Product'))
        if (!isProduct) continue

        const imageValue = obj.image
        if (Array.isArray(imageValue)) {
          for (const image of imageValue) {
            if (typeof image === 'string') {
              collected.push(absoluteUrl(BASE_URL, image))
            }
          }
        } else if (typeof imageValue === 'string') {
          collected.push(absoluteUrl(BASE_URL, imageValue))
        }
      }
    } catch {
      // Ignore malformed JSON-LD blocks.
    }
  })

  return dedupeStrings(collected)
}

function parsePriceFromJsonLd($: ReturnType<typeof load>): number | null {
  let parsedPrice: number | null = null

  $('script[type="application/ld+json"]').each((_, element) => {
    if (parsedPrice !== null) return
    const raw = $(element).html()
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as unknown
      const blocks = Array.isArray(parsed) ? parsed : [parsed]

      for (const block of blocks) {
        if (!block || typeof block !== 'object') continue
        const obj = block as Record<string, unknown>
        const typeValue = obj['@type']
        const isProduct =
          typeValue === 'Product' ||
          (Array.isArray(typeValue) && typeValue.includes('Product'))
        if (!isProduct) continue

        const offers = obj.offers
        if (!offers) continue

        const offerBlocks = Array.isArray(offers) ? offers : [offers]
        for (const offer of offerBlocks) {
          if (!offer || typeof offer !== 'object') continue
          const priceValue = (offer as Record<string, unknown>).price
          if (typeof priceValue === 'string') {
            parsedPrice = parsePriceToRupees(priceValue)
            if (parsedPrice !== null) return
          } else if (typeof priceValue === 'number') {
            parsedPrice = Math.round(priceValue)
            return
          }
        }
      }
    } catch {
      // Ignore malformed JSON-LD blocks.
    }
  })

  return parsedPrice
}

function parseProduct(html: string, sourceUrl: string): ScrapedProduct | null {
  const $ = load(html)

  const handle = productHandleFromUrl(sourceUrl)
  if (!handle) return null

  const title =
    normalizeWhitespace(
      $('meta[property="og:title"]').attr('content') ||
        $('h1').first().text() ||
        $('title').text(),
    ) || handle

  const description = normalizeWhitespace(
    $('meta[name="description"]').attr('content') ||
      $('[class*="description"]').first().text() ||
      '',
  )

  const jsonLdPrice = parsePriceFromJsonLd($)
  const textPrice = normalizeWhitespace(
    $('[itemprop="price"]').attr('content') ||
      $('[class*="price"]').first().text() ||
      '',
  )
  const fallbackPrice = parsePriceToRupees(textPrice)
  const price = jsonLdPrice ?? fallbackPrice
  if (price === null) return null

  const jsonLdImages = parseJsonLdProductImages($)
  const ogImage = $('meta[property="og:image"]').attr('content')
  const galleryImages = dedupeStrings([
    ...jsonLdImages,
    ...(ogImage ? [absoluteUrl(BASE_URL, ogImage)] : []),
  ])

  const primaryImage = galleryImages[0]
  if (!primaryImage) return null

  return {
    id: safeProductId(BRAND_ID, handle),
    brandId: BRAND_ID,
    title,
    description,
    price,
    image: primaryImage,
    images: galleryImages,
    sourceUrl,
  }
}

async function collectProductUrls(opts: ScrapeOptions): Promise<string[]> {
  const urls: string[] = []
  const seen = new Set<string>()

  for (let page = 1; page <= opts.maxPages; page += 1) {
    const html = await fetchText(getListingPageUrl(page))
    const pageUrls = extractProductUrlsFromListing(html)
    let pageNewCount = 0

    for (const url of pageUrls) {
      if (seen.has(url)) continue
      seen.add(url)
      urls.push(url)
      pageNewCount += 1

      if (urls.length >= opts.maxProducts) {
        return urls
      }
    }

    if (pageNewCount === 0) {
      break
    }
  }

  return urls
}

export async function scrapeJindjan(
  opts: ScrapeOptions,
): Promise<BrandScrapeResult> {
  const productUrls = await collectProductUrls(opts)
  const items: ScrapedProduct[] = []

  for (const productUrl of productUrls) {
    try {
      const html = await fetchText(productUrl)
      const item = parseProduct(html, productUrl)
      if (!item) continue
      items.push(item)
      if (items.length >= opts.maxProducts) break
    } catch {
      // Continue if one product page fails.
    }
  }

  return {
    brandId: BRAND_ID,
    items,
  }
}


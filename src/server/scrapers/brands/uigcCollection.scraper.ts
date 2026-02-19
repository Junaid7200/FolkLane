import { load } from 'cheerio'
import type { BrandScrapeResult, ScrapeOptions, ScrapedProduct } from '../base/types'
import {
  absoluteUrl,
  dedupeImageUrls,
  dedupeStrings,
  fetchText,
  normalizeWhitespace,
  productHandleFromUrl,
  safeProductId,
  sanitizeHtml,
} from '../base/utils'

const BRAND_ID = 'uigc-collection'
const BASE_URL = 'https://shop.urge.pk'
const COLLECTION_SLUGS = ['khaddar2pc', '2pcsummer26'] as const
const IMAGE_FILE_PATTERN = /\.(jpg|jpeg|png|webp|avif|gif)(\?|$)/i

function getCollectionPageUrl(collectionSlug: string, page: number) {
  const url = new URL(`/collections/${collectionSlug}`, BASE_URL)
  if (page > 1) {
    url.searchParams.set('page', String(page))
  }
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

function extractProductUrlsFromCollection(html: string): Array<string> {
  const $ = load(html)
  const urls: Array<string> = []

  $('a[href*="/products/"]').each((_, element) => {
    const href = $(element).attr('href')
    if (!href) return
    const normalized = normalizeProductUrl(href)
    if (normalized) urls.push(normalized)
  })

  return dedupeStrings(urls)
}

function parseAmountFromText(text: string): number | null {
  const cleaned = normalizeWhitespace(text)
    .replace(/PKR/gi, '')
    .replace(/RS\.?/gi, '')
  const match = cleaned.match(/(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/)
  if (!match?.[1]) return null

  const parsed = Number.parseFloat(match[1].replace(/,/g, ''))
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  return Math.round(parsed)
}

function parsePrice($: ReturnType<typeof load>): number | null {
  const preferredSelectors = [
    '.price-amount',
    '.pdp__price .price-amount',
    '[class*="price-amount"]',
  ]

  for (const selector of preferredSelectors) {
    const values: Array<string> = []
    $(selector).each((_, element) => {
      const text = normalizeWhitespace($(element).text())
      if (text.length > 0) values.push(text)
    })

    for (const value of values) {
      const amount = parseAmountFromText(value)
      if (amount !== null) return amount
    }
  }

  const fallbackTexts: Array<string> = []
  $('[class*="price"]').each((_, element) => {
    const className = ($(element).attr('class') || '').toLowerCase()
    if (className.includes('line-through')) return
    if (className.includes('is-hvc-price-amount')) return
    if (className.includes('price-currency')) return

    const text = normalizeWhitespace($(element).text())
    if (!/\d/.test(text)) return
    fallbackTexts.push(text)
  })

  for (const value of fallbackTexts) {
    const amount = parseAmountFromText(value)
    if (amount !== null) return amount
  }

  return null
}

function extractUrlsFromSet(value: string): Array<string> {
  return value
    .split(',')
    .map((part) => part.trim().split(/\s+/)[0] || '')
    .filter((item) => item.length > 0)
}

function toAbsoluteImageUrl(href: string): string | null {
  try {
    return absoluteUrl(BASE_URL, href)
  } catch {
    return null
  }
}

function isLikelyProductImage(url: string): boolean {
  const value = url.toLowerCase()
  if (!value.includes('cdn.shopify.com/s/files/')) return false
  if (!IMAGE_FILE_PATTERN.test(value)) return false

  const blockedKeywords = ['logo', 'fav_icon', 'favicon', 'icon']
  return blockedKeywords.every((keyword) => !value.includes(keyword))
}

function parseImages($: ReturnType<typeof load>): Array<string> {
  const rawValues: Array<string> = []
  const selectors = [
    'img.lazy_image',
    '.pdp img',
    '[class*="carousel"] img',
    'img[src*="cdn.shopify.com/s/files/"]',
    'img[srcset*="cdn.shopify.com/s/files/"]',
  ]

  $(selectors.join(',')).each((_, element) => {
    const el = $(element)
    const attrs = [el.attr('srcset'), el.attr('src'), el.attr('data-src')]
    for (const attr of attrs) {
      if (attr && attr.trim().length > 0) rawValues.push(attr.trim())
    }
  })

  const candidates: Array<string> = []
  for (const value of rawValues) {
    if (
      value.includes(',') ||
      /\s\d+w\b/.test(value) ||
      /\s\d+x\b/.test(value)
    ) {
      candidates.push(...extractUrlsFromSet(value))
      continue
    }
    candidates.push(value)
  }

  const normalized = candidates
    .map((candidate) => toAbsoluteImageUrl(candidate))
    .filter((value): value is string => Boolean(value))
    .filter(isLikelyProductImage)

  return dedupeImageUrls(normalized)
}

function parseDescription($: ReturnType<typeof load>, fallbackTitle: string): string {
  const candidates: Array<string> = []
  const selectors = [
    '.product__description',
    '[class*="description"]',
    '[itemprop="description"]',
  ]

  // Try to get HTML content first to preserve formatting
  for (const selector of selectors) {
    const element = $(selector).first()
    const html = element.html()
    if (html && html.length > 0) {
      const sanitized = sanitizeHtml(html)
      if (sanitized.length >= 40) {
        return sanitized
      }
    }
  }

  // Fallback to text extraction if HTML is too short
  for (const selector of selectors) {
    $(selector).each((_, element) => {
      const text = normalizeWhitespace($(element).text())
      if (text.length > 0) candidates.push(text)
    })
  }

  const metaDescription = normalizeWhitespace(
    $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      '',
  )
  if (metaDescription.length > 0) candidates.push(metaDescription)

  const deduped = dedupeStrings(candidates)
  deduped.sort((a, b) => b.length - a.length)
  return deduped[0] || fallbackTitle
}

async function parseProduct(url: string): Promise<ScrapedProduct | null> {
  const html = await fetchText(url)
  const $ = load(html)
  const handle = productHandleFromUrl(url)
  if (!handle) return null

  const title =
    normalizeWhitespace(
      $('meta[property="og:title"]').attr('content') ||
        $('h1').first().text() ||
        $('title').text(),
    ) || handle

  const price = parsePrice($)
  if (price === null || price <= 0) return null

  const images = parseImages($)
  const primaryImage = images[0]
  if (!primaryImage) return null

  const description = parseDescription($, title)

  return {
    id: safeProductId(BRAND_ID, handle),
    brandId: BRAND_ID,
    title,
    description,
    price,
    image: primaryImage,
    images,
    sourceUrl: url,
  }
}

async function collectProductUrls(opts: ScrapeOptions): Promise<Array<string>> {
  const urls: Array<string> = []
  const seen = new Set<string>()

  for (const collectionSlug of COLLECTION_SLUGS) {
    for (let page = 1; page <= opts.maxPages; page += 1) {
      const html = await fetchText(getCollectionPageUrl(collectionSlug, page))
      const pageUrls = extractProductUrlsFromCollection(html)
      let addedOnPage = 0

      for (const url of pageUrls) {
        if (seen.has(url)) continue
        seen.add(url)
        urls.push(url)
        addedOnPage += 1

        if (urls.length >= opts.maxProducts) return urls
      }

      if (addedOnPage === 0) break
    }
  }

  return urls
}

export async function scrapeUigcCollection(
  opts: ScrapeOptions,
): Promise<BrandScrapeResult> {
  const productUrls = await collectProductUrls(opts)
  const items: Array<ScrapedProduct> = []

  for (const productUrl of productUrls) {
    try {
      const item = await parseProduct(productUrl)
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

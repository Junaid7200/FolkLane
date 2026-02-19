import { load } from 'cheerio'
import { serverConfig } from '../../config/env'
import type {
  BrandScrapeResult,
  ScrapeOptions,
  ScrapedProduct,
} from '../base/types'
import {
  absoluteUrl,
  dedupeImageUrls,
  dedupeStrings,
  fetchJson,
  fetchText,
  normalizeWhitespace,
  productHandleFromUrl,
  safeProductId,
  sanitizeHtml,
} from '../base/utils'

const BRAND_ID = 'mirakk'
const BASE_URL = 'https://www.mirakk.com'
const COLLECTION_SLUG = 'new-arrivals-1'
const IMAGE_FILE_PATTERN = /\.(jpg|jpeg|png|webp|avif|gif)(\?|$)/i

type ShopifyProductJson = {
  images?: string[]
  featured_image?: string | null
  price?: number | string
  description?: string
  body_html?: string
  variants?: Array<{
    price?: number | string
  }>
}

type MoneyCurrency = 'USD' | 'PKR' | 'UNKNOWN'

function getCollectionPageUrl(page: number) {
  const url = new URL(`/collections/${COLLECTION_SLUG}`, BASE_URL)
  if (page > 1) {
    url.searchParams.set('page', String(page))
  }
  return url.toString()
}

function getProductJsonUrl(handle: string) {
  return `${BASE_URL}/products/${encodeURIComponent(handle)}.js`
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

function parseAmount(value: unknown): number | null {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value <= 0) return null
    if (Number.isInteger(value) && value >= 1000) return value / 100
    return value
  }

  if (typeof value !== 'string') return null
  const cleaned = value.replace(/[^\d.,]/g, '')
  if (!cleaned) return null
  const normalized = cleaned.replace(/,/g, '')
  const parsed = Number.parseFloat(normalized)
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  return parsed
}

function usdToPkr(usdAmount: number): number {
  const rate =
    Number.isFinite(serverConfig.usdToPkrRate) && serverConfig.usdToPkrRate > 0
      ? serverConfig.usdToPkrRate
      : 280
  return Math.round(usdAmount * rate)
}

function normalizePriceToPkr(
  amount: number | null,
  currency: MoneyCurrency,
): number | null {
  if (amount === null || amount <= 0) return null
  if (currency === 'USD') return usdToPkr(amount)
  return Math.round(amount)
}

function extractUrlsFromSet(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim().split(/\s+/)[0] || '')
    .filter((item) => item.length > 0)
}

function extractUrlsFromStyle(styleValue: string): string[] {
  const urls: string[] = []
  const pattern = /url\((['"]?)(.*?)\1\)/gi
  let match: RegExpExecArray | null = pattern.exec(styleValue)

  while (match) {
    const candidate = match[2]?.trim()
    if (candidate) urls.push(candidate)
    match = pattern.exec(styleValue)
  }

  return urls
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
  return value.includes('/cdn/shop/files/') && IMAGE_FILE_PATTERN.test(value)
}

function isPreferredShopifyImage(url: string): boolean {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase()
    return host === 'cdn.shopify.com' && parsed.pathname.includes('/s/files/')
  } catch {
    return false
  }
}

function isLowQualityPlaceholderImage(url: string): boolean {
  return /_1x1(?=\.[a-z0-9]+(?:\?|$))/i.test(url)
}

function sanitizeGalleryImages(images: string[]): string[] {
  const normalized = dedupeImageUrls(images)
  const withoutPlaceholders = normalized.filter(
    (image) => !isLowQualityPlaceholderImage(image),
  )
  if (withoutPlaceholders.length === 0) return normalized

  const preferred = withoutPlaceholders.filter(isPreferredShopifyImage)
  if (preferred.length > 0) {
    return dedupeImageUrls(preferred)
  }

  return dedupeImageUrls(withoutPlaceholders)
}

function parseDomGalleryImages($: ReturnType<typeof load>): string[] {
  const rawValues: string[] = []
  const selectors = [
    '.product__media img.image-magnify-hover',
    '.product__media img[src*="/cdn/shop/files/"]',
    'img.image-magnify-hover',
    'img[src*="/cdn/shop/files/"]',
    '[data-src*="/cdn/shop/files/"]',
    '[data-bgset]',
    '[data-zoom]',
    'img[srcset*="/cdn/shop/files/"]',
  ]

  $(selectors.join(',')).each((_, element) => {
    const el = $(element)
    const attrs = [
      el.attr('href'),
      el.attr('data-bgset'),
      el.attr('data-src'),
      el.attr('data-zoom'),
      el.attr('srcset'),
      el.attr('src'),
      el.attr('style'),
    ]
    for (const attr of attrs) {
      if (attr && attr.trim().length > 0) rawValues.push(attr.trim())
    }
  })

  const candidates: string[] = []
  for (const value of rawValues) {
    if (value.includes('url(')) {
      candidates.push(...extractUrlsFromStyle(value))
      continue
    }

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

  return sanitizeGalleryImages(normalized)
}

function parseJsonLdProductData($: ReturnType<typeof load>) {
  let images: string[] = []
  let amount: number | null = null
  let currency: MoneyCurrency = 'UNKNOWN'

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
            if (typeof image === 'string') images.push(absoluteUrl(BASE_URL, image))
          }
        } else if (typeof imageValue === 'string') {
          images.push(absoluteUrl(BASE_URL, imageValue))
        }

        const offers = obj.offers
        const offerBlocks = Array.isArray(offers) ? offers : offers ? [offers] : []
        for (const offer of offerBlocks) {
          if (!offer || typeof offer !== 'object') continue
          const offerRecord = offer as Record<string, unknown>
          if (amount === null) {
            amount = parseAmount(offerRecord.price)
          }
          if (currency === 'UNKNOWN') {
            const rawCurrency = offerRecord.priceCurrency
            if (typeof rawCurrency === 'string') {
              const normalizedCurrency = rawCurrency.toUpperCase()
              if (normalizedCurrency === 'USD') currency = 'USD'
              if (normalizedCurrency === 'PKR') currency = 'PKR'
            }
          }
        }
      }
    } catch {
      // Ignore malformed JSON-LD blocks.
    }
  })

  images = sanitizeGalleryImages(images)
  return { images, amount, currency }
}

function detectCurrencyFromDom(
  $: ReturnType<typeof load>,
  fallback: MoneyCurrency,
): MoneyCurrency {
  const metaCurrency = normalizeWhitespace(
    $('meta[property="product:price:currency"]').attr('content') ||
      $('meta[property="og:price:currency"]').attr('content') ||
      '',
  ).toUpperCase()

  if (metaCurrency === 'USD') return 'USD'
  if (metaCurrency === 'PKR') return 'PKR'

  const priceText = normalizeWhitespace(
    $('.price .money').first().text() ||
      $('[itemprop="price"]').first().text() ||
      $('[class*="price"]').first().text() ||
      '',
  ).toUpperCase()
  if (priceText.includes('$')) return 'USD'
  if (priceText.includes('RS') || priceText.includes('PKR')) return 'PKR'

  return fallback
}

async function fetchShopifyProductData(handle: string) {
  return fetchJson<ShopifyProductJson>(getProductJsonUrl(handle))
}

function parseShopifyImages(data: ShopifyProductJson): string[] {
  const values: string[] = []
  if (Array.isArray(data.images)) {
    for (const image of data.images) {
      if (typeof image === 'string') {
        values.push(absoluteUrl(BASE_URL, image))
      }
    }
  }
  if (typeof data.featured_image === 'string') {
    values.push(absoluteUrl(BASE_URL, data.featured_image))
  }
  return sanitizeGalleryImages(values)
}

function parseShopifyAmount(data: ShopifyProductJson): number | null {
  const candidates: unknown[] = [data.price]
  if (Array.isArray(data.variants)) {
    for (const variant of data.variants) {
      candidates.push(variant?.price)
    }
  }

  for (const candidate of candidates) {
    const amount = parseAmount(candidate)
    if (amount !== null) return amount
  }

  return null
}

function parseShopifyDescription(data: ShopifyProductJson): string {
  const html = data.body_html || data.description || ''
  if (!html) return ''
  return sanitizeHtml(html)
}

function extractFullDescription($: ReturnType<typeof load>): string {
  const candidates: string[] = []
  const selectors = [
    '.product__description.rte.quick-add-hidden',
    '.product__description.rte',
    '.product__description',
    '[class*="product__description"]',
    '.rte',
    '[itemprop="description"]',
  ]

  for (const selector of selectors) {
    $(selector).each((_, element) => {
      const text = normalizeWhitespace($(element).text())
      if (text.length >= 40) candidates.push(text)
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
  return deduped[0] || ''
}

function parseDomAmount($: ReturnType<typeof load>): number | null {
  const candidates = [
    $('meta[property="product:price:amount"]').attr('content') || '',
    $('[itemprop="price"]').attr('content') || '',
    $('[itemprop="price"]').first().text() || '',
    $('.price .price-item--sale').first().text() || '',
    $('.price .money').first().text() || '',
    $('[class*="price"] .money').first().text() || '',
    $('[class*="price"]').first().text() || '',
  ]

  for (const candidate of candidates) {
    const amount = parseAmount(normalizeWhitespace(candidate))
    if (amount !== null) return amount
  }

  return null
}

async function parseProduct(
  html: string,
  sourceUrl: string,
): Promise<ScrapedProduct | null> {
  const $ = load(html)
  const handle = productHandleFromUrl(sourceUrl)
  if (!handle) return null

  const title =
    normalizeWhitespace(
      $('meta[property="og:title"]').attr('content') ||
        $('h1').first().text() ||
        $('title').text(),
    ) || handle

  const jsonLdData = parseJsonLdProductData($)
  const domCurrency = detectCurrencyFromDom($, jsonLdData.currency)

  let shopifyDescription = ''
  let shopifyImages: string[] = []
  let shopifyAmount: number | null = null
  try {
    const shopifyData = await fetchShopifyProductData(handle)
    shopifyDescription = parseShopifyDescription(shopifyData)
    shopifyImages = parseShopifyImages(shopifyData)
    shopifyAmount = parseShopifyAmount(shopifyData)
  } catch {
    // Continue with DOM and JSON-LD fallbacks.
  }

  const descriptionCandidates = dedupeStrings([
    shopifyDescription,
    extractFullDescription($),
  ])
  descriptionCandidates.sort((a, b) => b.length - a.length)
  const description = descriptionCandidates[0] || ''

  const domImages = parseDomGalleryImages($)
  const ogImage = $('meta[property="og:image"]').attr('content')
  const images = sanitizeGalleryImages([
    ...shopifyImages,
    ...domImages,
    ...jsonLdData.images,
    ...(ogImage ? [absoluteUrl(BASE_URL, ogImage)] : []),
  ])
  const primaryImage = images[0]
  if (!primaryImage) return null

  const amount = shopifyAmount ?? jsonLdData.amount ?? parseDomAmount($)
  const price = normalizePriceToPkr(amount, domCurrency)
  if (price === null || price <= 0) return null

  return {
    id: safeProductId(BRAND_ID, handle),
    brandId: BRAND_ID,
    title,
    description,
    price,
    image: primaryImage,
    images,
    sourceUrl,
  }
}

async function collectProductUrls(opts: ScrapeOptions): Promise<string[]> {
  const urls: string[] = []
  const seen = new Set<string>()

  for (let page = 1; page <= opts.maxPages; page += 1) {
    const html = await fetchText(getCollectionPageUrl(page))
    const pageUrls = extractProductUrlsFromListing(html)
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

  return urls
}

export async function scrapeMirakk(
  opts: ScrapeOptions,
): Promise<BrandScrapeResult> {
  const productUrls = await collectProductUrls(opts)
  const items: ScrapedProduct[] = []

  for (const productUrl of productUrls) {
    try {
      const html = await fetchText(productUrl)
      const item = await parseProduct(html, productUrl)
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

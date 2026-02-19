import { load } from 'cheerio'
import type { BrandScrapeResult, ScrapeOptions, ScrapedProduct } from '../base/types'
import {
  absoluteUrl,
  dedupeImageUrls,
  dedupeStrings,
  fetchJson,
  fetchText,
  normalizeWhitespace,
  parsePriceToRupees,
  productHandleFromUrl,
  safeProductId,
  sanitizeHtml,
} from '../base/utils'

const BRAND_ID = 'jindjan'
const BASE_URL = 'https://jindjan.com'
const COLLECTION_URL = `${BASE_URL}/collections/frontpage`

type ShopifyProductJson = {
  images?: string[]
  featured_image?: string | null
  description?: string
  body_html?: string
}

const IMAGE_FILE_PATTERN = /\.(jpg|jpeg|png|webp|avif|gif)(\?|$)/i

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

  const collectFromElement = (element: unknown) => {
    const el = $(element)
    const attrs = [
      el.attr('data-bgset'),
      el.attr('srcset'),
      el.attr('src'),
      el.attr('data-src'),
      el.attr('data-master'),
      el.attr('data-zoom'),
      el.attr('href'),
      el.attr('style'),
    ]
    for (const attr of attrs) {
      if (attr && attr.trim().length > 0) rawValues.push(attr.trim())
    }
  }

  $('.js-sl-item, .p-nav .n-item, .flickity-slider .n-item').each((_, element) => {
    collectFromElement(element)
    $(element)
      .find('[data-bgset], [srcset], [src], [data-src], [href], [style]')
      .each((__, child) => collectFromElement(child))
  })

  if (rawValues.length === 0) {
    $('[data-bgset], [srcset], img[src*="/cdn/shop/files/"]').each(
      (_, element) => {
        collectFromElement(element)
      },
    )
  }

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

  return dedupeImageUrls(normalized)
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
            const rounded = Math.round(priceValue)
            parsedPrice = rounded > 0 ? rounded : null
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

function getShopifyProductJsonUrl(handle: string) {
  return `${BASE_URL}/products/${encodeURIComponent(handle)}.js`
}

async function fetchShopifyProductData(handle: string): Promise<{
  images: string[]
  description: string
}> {
  const payload = await fetchJson<ShopifyProductJson>(getShopifyProductJsonUrl(handle))
  const images: string[] = []

  if (Array.isArray(payload.images)) {
    for (const image of payload.images) {
      if (typeof image === 'string') {
        images.push(absoluteUrl(BASE_URL, image))
      }
    }
  }

  if (typeof payload.featured_image === 'string') {
    images.push(absoluteUrl(BASE_URL, payload.featured_image))
  }

  const descriptionHtml = payload.body_html || payload.description || ''
  const description = descriptionHtml ? sanitizeHtml(descriptionHtml) : ''

  return {
    images: dedupeImageUrls(images),
    description,
  }
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

  const jsonLdPrice = parsePriceFromJsonLd($)
  const textPrice = normalizeWhitespace(
    $('[itemprop="price"]').attr('content') ||
      $('[class*="price"]').first().text() ||
      '',
  )
  const fallbackPrice = parsePriceToRupees(textPrice)
  const price = jsonLdPrice ?? fallbackPrice
  if (price === null || price <= 0) return null

  // Fetch product data from Shopify JSON API (includes images and description)
  let shopifyData: { images: string[]; description: string } = { images: [], description: '' }
  try {
    shopifyData = await fetchShopifyProductData(handle)
  } catch {
    // Keep HTML extraction as fallback when JSON endpoint is unavailable.
  }

  // Use Shopify description if available, otherwise fall back to HTML extraction
  const description = shopifyData.description ||
    (() => {
      const descriptionHtml =
        $('.product__description').html() ||
        $('[class*="description"]').first().html() ||
        $('[itemprop="description"]').html() ||
        ''
      return descriptionHtml
        ? sanitizeHtml(descriptionHtml)
        : normalizeWhitespace($('meta[name="description"]').attr('content') || '')
    })()

  const domGalleryImages = parseDomGalleryImages($)
  const jsonLdImages = parseJsonLdProductImages($)
  const ogImage = $('meta[property="og:image"]').attr('content')
  const galleryImages = sanitizeGalleryImages([
    ...shopifyData.images,
    ...domGalleryImages,
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

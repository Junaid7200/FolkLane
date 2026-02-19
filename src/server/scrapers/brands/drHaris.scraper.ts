import { load } from 'cheerio'
import type {BrandScrapeResult, ScrapeOptions, ScrapedProduct } from '../base/types'
import {
  absoluteUrl,
  dedupeImageUrls,
  dedupeStrings,
  fetchText,
  normalizeWhitespace,
  parsePriceToRupees,
  productHandleFromUrl,
  safeProductId,
  sanitizeHtml,
} from '../base/utils'

const BRAND_ID = 'dr-haris'
const BASE_URL = 'https://drharis.co'
const COLLECTION_SLUG = 'new-arrivals'
const IMAGE_FILE_PATTERN = /\.(jpg|jpeg|png|webp|avif|gif)(\?|$)/i

function getListingPageUrl(page: number) {
  if (page === 1) {
    return `${BASE_URL}/product-category/${COLLECTION_SLUG}/`
  }
  return `${BASE_URL}/product-category/${COLLECTION_SLUG}/page/${page}/`
}

function normalizeProductUrl(href: string): string | null {
  try {
    const absolute = new URL(href, BASE_URL)
    if (!absolute.pathname.startsWith('/product/')) return null

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

  // WooCommerce uses <a> tags with href to product pages within .product items
  $('li.product a[href*="/product/"]').each((_, el) => {
    const href = $(el).attr('href')
    if (!href) return

    const normalized = normalizeProductUrl(href)
    if (normalized) urls.push(normalized)
  })

  return dedupeStrings(urls)
}

function extractImagesFromGallery($: ReturnType<typeof load>): string[] {
  const images: string[] = []

  // Ciyashop theme uses custom gallery classes + standard WooCommerce fallback
  $('.ciyashop-product-gallery__image img, .woocommerce-product-gallery__image img').each((_, el) => {
    const src = $(el).attr('data-large_image') || $(el).attr('data-src') || $(el).attr('src')
    if (src && IMAGE_FILE_PATTERN.test(src)) {
      images.push(absoluteUrl(BASE_URL, src))
    }
  })

  console.log(`[dr-haris] found ${images.length} gallery images`)

  // Additional gallery images in srcset
  $('.ciyashop-product-gallery__image img, .woocommerce-product-gallery__image img').each((_, el) => {
    const srcset = $(el).attr('srcset') || $(el).attr('data-srcset')
    if (srcset) {
      const urls = srcset
        .split(',')
        .map((part) => part.trim().split(/\s+/)[0])
        .filter((url) => url && IMAGE_FILE_PATTERN.test(url))
      images.push(...urls.map((url) => absoluteUrl(BASE_URL, url)))
    }
  })

  // Fallback: product thumbnails
  $('.flex-control-thumbs img, .product-thumbnails img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src')
    if (src && IMAGE_FILE_PATTERN.test(src)) {
      images.push(absoluteUrl(BASE_URL, src))
    }
  })

  return images
}

function extractPrice($: ReturnType<typeof load>): number | null {
  // Try WooCommerce standard price
  const priceText = normalizeWhitespace(
    $('p.price .woocommerce-Price-amount bdi').first().text() ||
      $('span.price .woocommerce-Price-amount bdi').first().text() ||
      $('.woocommerce-Price-amount bdi').first().text() ||
      $('p.price').first().text() ||
      '',
  )

  console.log(`[dr-haris] raw price text: "${priceText}"`)
  const price = parsePriceToRupees(priceText)
  return price && price > 0 ? price : null
}

function extractDescription($: ReturnType<typeof load>): string {
  // Try WooCommerce short description first
  const shortDesc = $('.woocommerce-product-details__short-description').html()
  if (shortDesc && shortDesc.trim().length > 20) {
    return sanitizeHtml(shortDesc)
  }

  // Try product description tab content
  const fullDesc = $('#tab-description, .woocommerce-Tabs-panel--description').html()
  if (fullDesc && fullDesc.trim().length > 20) {
    return sanitizeHtml(fullDesc)
  }

  // Fallback: meta description
  const metaDesc = $('meta[name="description"]').attr('content')
  if (metaDesc) {
    return normalizeWhitespace(metaDesc)
  }

  return ''
}

async function parseProduct(
  html: string,
  sourceUrl: string,
): Promise<ScrapedProduct | null> {
  const $ = load(html)

  const handle = productHandleFromUrl(sourceUrl)
  if (!handle) {
    console.log(`[dr-haris] ✗ no handle extracted from ${sourceUrl}`)
    return null
  }

  // Extract title
  const title =
    normalizeWhitespace(
      $('h1.product_title, h1.entry-title').text() ||
        $('.product-title').text() ||
        $('meta[property="og:title"]').attr('content') ||
        $('title').text(),
    ) || handle
  console.log(`[dr-haris] extracted title: "${title}"`)

  // Extract price
  const price = extractPrice($)
  console.log(`[dr-haris] extracted price: ${price}`)
  if (price === null || price <= 0) {
    console.log(`[dr-haris] ✗ invalid price (${price})`)
    return null
  }

  // Extract description
  const description = extractDescription($)

  // Extract images
  const galleryImages = extractImagesFromGallery($)
  const ogImage = $('meta[property="og:image"]').attr('content')
  const allImages = dedupeImageUrls([
    ...galleryImages,
    ...(ogImage ? [absoluteUrl(BASE_URL, ogImage)] : []),
  ])
  console.log(`[dr-haris] extracted ${allImages.length} images`)

  const primaryImage = allImages[0]
  if (!primaryImage) {
    console.log(`[dr-haris] ✗ no primary image found`)
    return null
  }

  return {
    id: safeProductId(BRAND_ID, handle),
    brandId: BRAND_ID,
    title,
    description,
    price,
    image: primaryImage,
    images: allImages,
    sourceUrl,
  }
}

async function collectProductUrls(opts: ScrapeOptions): Promise<string[]> {
  const urls: string[] = []
  const seen = new Set<string>()
  let page = 1
  const maxPages = opts.maxPages ?? 5 // Fetch 5 pages to get ~20+ products

  console.log(`[dr-haris] collecting product URLs (max ${maxPages} pages)`)

  while (page <= maxPages) {
    const listingUrl = getListingPageUrl(page)
    console.log(`[dr-haris] fetching page ${page}: ${listingUrl}`)
    const html = await fetchText(listingUrl)
    const pageUrls = extractProductUrlsFromListing(html)
    console.log(`[dr-haris] page ${page} found ${pageUrls.length} product URLs`)

    if (pageUrls.length === 0) break

    for (const url of pageUrls) {
      if (seen.has(url)) continue
      seen.add(url)
      urls.push(url)
    }

    page++
  }

  return urls
}

export async function scrapeDrHaris(opts: ScrapeOptions): Promise<BrandScrapeResult> {
  const productUrls = await collectProductUrls(opts)
  console.log(`[dr-haris] found ${productUrls.length} product URLs`)

  const limit = opts.maxProducts ?? productUrls.length
  const urlsToScrape = productUrls.slice(0, limit)
  console.log(`[dr-haris] will scrape ${urlsToScrape.length} products`)

  const products: ScrapedProduct[] = []

  for (const url of urlsToScrape) {
    try {
      console.log(`[dr-haris] scraping ${url}`)
      const html = await fetchText(url)
      const product = await parseProduct(html, url)
      if (product) {
        products.push(product)
        console.log(`[dr-haris] ✓ scraped: ${product.title} - Rs.${product.price}`)
      } else {
        console.log(`[dr-haris] ✗ no product data extracted from ${url}`)
      }
    } catch (error) {
      console.error(`[dr-haris] failed to scrape ${url}:`, error)
    }
  }

  console.log(`[dr-haris] scraped ${products.length} products successfully`)

  return {
    brandId: BRAND_ID,
    items: products,
  }
}

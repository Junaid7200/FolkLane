import { getDatabase } from '../../db/client'
import { ensureDatabaseReady } from '../../db/init'
import { replaceProductsByBrand } from '../../db/repositories/productsRepo'
import type { ProductRow } from '../../db/schema'
import { scrapeDmCollection } from '../brands/dmCollection.scraper'
import { scrapeJindjan } from '../brands/jindjan.scraper'
import { scrapeMariaNasir } from '../brands/mariaNasir.scraper'
import { scrapeMirakk } from '../brands/mirakk.scraper'
import { scrapeMtf } from '../brands/mtf.scraper'
import { scrapeCosset } from '../brands/cosset.scraper'
import { scrapeSobiaNazir } from '../brands/sobiaNazir.scraper'
import { scrapeUigcCollection } from '../brands/uigcCollection.scraper'
import { scrapeSaima } from '../brands/saima.scraper'
import { scrapeKhalidRashidFabrics } from '../brands/khalidRashidFabrics.scraper'
import { scrapeRoyalGarments } from '../brands/royalGarments.scraper'
import type { BrandScrapeResult, ScrapeOptions } from '../base/types'

function nowIso() {
  return new Date().toISOString()
}

function toProductRows(result: BrandScrapeResult): ProductRow[] {
  const now = nowIso()
  return result.items.map((item) => ({
    id: item.id,
    brandId: item.brandId,
    title: item.title,
    description: item.description || '',
    price: item.price,
    image: item.image,
    images: item.images.length > 0 ? item.images : [item.image],
    sourceUrl: item.sourceUrl,
    lastScrapedAt: now,
    createdAt: now,
    updatedAt: now,
  }))
}

function resolveOptions(input?: Partial<ScrapeOptions>): ScrapeOptions {
  return {
    maxProducts: input?.maxProducts ?? 100,
    maxPages: input?.maxPages ?? 20,
  }
}

async function scrapeByBrand(
  brandId: string,
  options: ScrapeOptions,
): Promise<BrandScrapeResult> {
  if (brandId === 'jindjan') {
    return scrapeJindjan(options)
  }
  if (brandId === 'd-m-collection') {
    return scrapeDmCollection(options)
  }
  if (brandId === 'maria-nasir') {
    return scrapeMariaNasir(options)
  }
  if (brandId === 'mirakk') {
    return scrapeMirakk(options)
  }
  if (brandId === 'mtf') {
    return scrapeMtf(options)
  }
  if (brandId === 'cosset') {
    return scrapeCosset(options)
  }
  if (brandId === 'sobia-nazir') {
    return scrapeSobiaNazir(options)
  }
  if (brandId === 'uigc-collection') {
    return scrapeUigcCollection(options)
  }
  if (brandId === 'saima') {
    return scrapeSaima(options)
  }
  if (brandId === 'khalid-rashid-fabrics') {
    return scrapeKhalidRashidFabrics(options)
  }
  if (brandId === 'royal-garments') {
    return scrapeRoyalGarments(options)
  }

  throw new Error(`No scraper implemented for brand: ${brandId}`)
}

export async function runBrandScrape(
  brandId: string,
  inputOptions?: Partial<ScrapeOptions>,
) {
  const options = resolveOptions(inputOptions)
  const scrapeResult = await scrapeByBrand(brandId, options)
  if (scrapeResult.items.length === 0) {
    throw new Error(`Scraper returned zero products for brand: ${brandId}`)
  }
  const products = toProductRows(scrapeResult)

  await ensureDatabaseReady()
  const db = getDatabase()
  replaceProductsByBrand(db, brandId, products)

  return {
    brandId,
    scrapedCount: scrapeResult.items.length,
    storedCount: products.length,
  }
}

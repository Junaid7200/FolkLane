export type ScrapedProduct = {
  id: string
  brandId: string
  title: string
  description: string
  price: number
  image: string
  images: string[]
  sourceUrl: string
}

export type ScrapeOptions = {
  maxProducts: number
  maxPages: number
}

export type BrandScrapeResult = {
  brandId: string
  items: ScrapedProduct[]
}


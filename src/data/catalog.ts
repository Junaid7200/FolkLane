type CategoryId = 'luxury' | 'casual' | 'cheap'

export type Brand = {
  id: string
  name: string
  category: CategoryId
  description?: string
}

export type Item = {
  id: string
  title: string
  description: string
  price: number
  brandId: string
  image: string
}

export type CatalogData = {
  categories: CategoryId[]
  brands: Brand[]
  items: Item[]
}

const PLACEHOLDER_IMAGE = '/placeholder.jpg'
const BRAND_IMAGE_DIR = '/brands'

function withFallbackImage(items: Item[]): Item[] {
  return items.map((item) => ({
    ...item,
    image: item.image || PLACEHOLDER_IMAGE,
  }))
}

const localCatalog: CatalogData = {
  categories: ['luxury', 'casual', 'cheap'],
  brands: [
    { id: 'mtf', name: 'MTF', category: 'luxury', description: 'Timeless elegance and sophistication' },
    { id: 'cosset', name: 'Cosset', category: 'luxury', description: 'Premium designer collections' },
    { id: 'maria-nasir', name: 'Maria Nasir', category: 'luxury', description: 'Luxury formal fashion' },
    { id: 'd-m-collection', name: 'D&M Collection', category: 'casual', description: 'Contemporary casual wear' },
    { id: 'sobia-nazir', name: 'Sobia Nazir', category: 'casual', description: 'Elegant everyday fashion' },
    { id: 'jindjan', name: 'Jindjan', category: 'casual', description: 'Modern casual style' },
    { id: 'ameena', name: 'Ameena', category: 'cheap', description: 'Quality fashion on budget' },
    { id: 'uigc-collection', name: 'Urge', category: 'cheap', description: 'Affordable everyday wear' },
    { id: 'mirakk', name: 'Mirakk', category: 'cheap', description: 'Value-priced fashion' },
  ],
  items: [
    // MTF (Luxury)
    { id: 'mtf-1', title: 'Elegant Bridal Dress', price: 45000, description: 'A stunning bridal dress crafted with intricate embroidery and premium fabrics. Perfect for your special day, this piece combines traditional elegance with contemporary design.', brandId: 'mtf', image: `${BRAND_IMAGE_DIR}/mtf/mtf-1.jpg` },
    { id: 'mtf-2', title: 'Luxury Embroidered Shawl', price: 42000, description: 'Exquisite handwoven shawl featuring traditional embroidery and luxurious fabric. A timeless addition to any formal outfit.', brandId: 'mtf', image: `${BRAND_IMAGE_DIR}/mtf/mtf-2.jpg` },
    { id: 'mtf-3', title: 'Designer Wedding Collection', price: 48000, description: 'Complete wedding ensemble with intricate detailing and premium materials. Designed for those who seek perfection on their special day.', brandId: 'mtf', image: `${BRAND_IMAGE_DIR}/mtf/mtf-3.jpg` },
    { id: 'mtf-4', title: 'Premium Silk Ensemble', price: 39000, description: 'Pure silk outfit with delicate handwork and elegant draping. Perfect for festive occasions and celebrations.', brandId: 'mtf', image: `${BRAND_IMAGE_DIR}/mtf/mtf-4.jpg` },
    { id: 'mtf-5', title: 'Royal Festive Wear', price: 46000, description: 'Regal festive collection featuring rich embellishments and traditional craftsmanship. Stand out at any celebration.', brandId: 'mtf', image: `${BRAND_IMAGE_DIR}/mtf/mtf-5.jpg` },

    // Cosset (Luxury)
    { id: 'cosset-1', title: 'Premium Silk Kurta', price: 38000, description: 'Luxurious silk kurta featuring delicate handwork and modern silhouette. Ideal for formal occasions and celebrations.', brandId: 'cosset', image: `${BRAND_IMAGE_DIR}/cosset/cosset-1.jpg` },
    { id: 'cosset-2', title: 'Royal Collection Dress', price: 48000, description: 'Elegant royal dress with intricate embroidery and premium silk fabric. Perfect for formal events and grand celebrations.', brandId: 'cosset', image: `${BRAND_IMAGE_DIR}/cosset/cosset-2.jpg` },
    { id: 'cosset-3', title: 'Luxury Evening Gown', price: 52000, description: 'Sophisticated evening gown with contemporary design and traditional embellishments. Make a statement at any formal gathering.', brandId: 'cosset', image: `${BRAND_IMAGE_DIR}/cosset/cosset-3.jpg` },
    { id: 'cosset-4', title: 'Designer Party Wear', price: 44000, description: 'Exclusive party wear featuring modern cuts and traditional embroidery. Blend of contemporary style and cultural elegance.', brandId: 'cosset', image: `${BRAND_IMAGE_DIR}/cosset/cosset-4.jpg` },
    { id: 'cosset-5', title: 'Exclusive Bridal Set', price: 55000, description: 'Complete bridal collection with matching accessories and premium fabrics. Designed for brides who want perfection.', brandId: 'cosset', image: `${BRAND_IMAGE_DIR}/cosset/cosset-5.jpg` },

    // Maria Nasir (Luxury)
    { id: 'maria-1', title: 'Embroidered Formal Suit', price: 52000, description: 'Luxurious formal suit with intricate embroidery and premium fabric. Designed for high-end festive occasions.', brandId: 'maria-nasir', image: `${BRAND_IMAGE_DIR}/maria-nasir/maria-1.jpg` },
    { id: 'maria-2', title: 'Silk Peplum Set', price: 55000, description: 'Elegant silk peplum with matching trousers, crafted for modern formal wear with a classic finish.', brandId: 'maria-nasir', image: `${BRAND_IMAGE_DIR}/maria-nasir/maria-2.jpg` },
    { id: 'maria-3', title: 'Bridal Couture Ensemble', price: 62000, description: 'Statement bridal couture outfit with layered detailing and rich handwork for special events.', brandId: 'maria-nasir', image: `${BRAND_IMAGE_DIR}/maria-nasir/maria-3.jpg` },
    { id: 'maria-4', title: 'Luxury Formal Kurta', price: 38000, description: 'Premium formal kurta with refined embellishments and a tailored silhouette.', brandId: 'maria-nasir', image: `${BRAND_IMAGE_DIR}/maria-nasir/maria-4.jpg` },
    { id: 'maria-5', title: 'Festive Chiffon Outfit', price: 68000, description: 'Flowing chiffon outfit with delicate embroidery and a festive look, perfect for evening wear.', brandId: 'maria-nasir', image: `${BRAND_IMAGE_DIR}/maria-nasir/maria-5.jpg` },

    // D&M Collection (Casual)
    { id: 'dm-1', title: 'Contemporary Kurta Set', price: 8500, description: 'Modern kurta set perfect for everyday wear. Comfortable fabric with stylish contemporary design.', brandId: 'd-m-collection', image: `${BRAND_IMAGE_DIR}/d-m-collection/dm-1.jpg` },
    { id: 'dm-2', title: 'Modern Casual Wear', price: 7200, description: 'Trendy casual outfit with comfortable fit and stylish design. Perfect for daily wear and casual outings.', brandId: 'd-m-collection', image: `${BRAND_IMAGE_DIR}/d-m-collection/dm-2.jpg` },
    { id: 'dm-3', title: 'Stylish Summer Collection', price: 9800, description: 'Light and breezy summer collection with modern prints and comfortable fabric. Stay stylish in the heat.', brandId: 'd-m-collection', image: `${BRAND_IMAGE_DIR}/d-m-collection/dm-3.jpg` },
    { id: 'dm-4', title: 'Trendy Office Wear', price: 8900, description: 'Professional office wear with contemporary design and comfortable fit. Look polished and feel comfortable all day.', brandId: 'd-m-collection', image: `${BRAND_IMAGE_DIR}/d-m-collection/dm-4.jpg` },
    { id: 'dm-5', title: 'Elegant Daily Dress', price: 7800, description: 'Versatile daily dress with elegant design and easy maintenance. Perfect for busy modern lifestyles.', brandId: 'd-m-collection', image: `${BRAND_IMAGE_DIR}/d-m-collection/dm-5.jpg` },

    // Sobia Nazir (Casual)
    { id: 'sobia-1', title: 'Elegant Lawn Collection', price: 12500, description: 'Premium lawn fabric with beautiful prints and elegant design. Perfect for summer occasions.', brandId: 'sobia-nazir', image: `${BRAND_IMAGE_DIR}/sobia-nazir/sobia-1.jpg` },
    { id: 'sobia-2', title: 'Summer Casual Wear', price: 9500, description: 'Lightweight casual wear with attractive prints and comfortable fabric. Ideal for summer days and casual events.', brandId: 'sobia-nazir', image: `${BRAND_IMAGE_DIR}/sobia-nazir/sobia-2.jpg` },
    { id: 'sobia-3', title: 'Classic Formal Dress', price: 14000, description: 'Elegant formal dress with classic design and quality fabric. Perfect for semi-formal occasions.', brandId: 'sobia-nazir', image: `${BRAND_IMAGE_DIR}/sobia-nazir/sobia-3.jpg` },
    { id: 'sobia-4', title: 'Stylish Kurta Set', price: 11000, description: 'Contemporary kurta set with modern embellishments and comfortable fit. Versatile for various occasions.', brandId: 'sobia-nazir', image: `${BRAND_IMAGE_DIR}/sobia-nazir/sobia-4.jpg` },
    { id: 'sobia-5', title: 'Modern Ethnic Wear', price: 13500, description: 'Fusion of modern style and ethnic design. Perfect for cultural events and festive occasions.', brandId: 'sobia-nazir', image: `${BRAND_IMAGE_DIR}/sobia-nazir/sobia-5.jpg` },

    // Jindjan (Casual)
    { id: 'jindjan-1', title: 'Casual Everyday Dress', price: 6500, description: 'Comfortable and stylish dress for daily wear. Easy to maintain with modern casual design.', brandId: 'jindjan', image: `${BRAND_IMAGE_DIR}/jindjan/jindjan-1.jpg` },
    { id: 'jindjan-2', title: 'Modern Kurta Collection', price: 7800, description: 'Trendy kurta collection with contemporary design and comfortable fabric. Perfect for daily wear.', brandId: 'jindjan', image: `${BRAND_IMAGE_DIR}/jindjan/jindjan-2.jpg` },
    { id: 'jindjan-3', title: 'Trendy Summer Wear', price: 5900, description: 'Light and comfortable summer outfit with modern prints. Stay cool and stylish in warm weather.', brandId: 'jindjan', image: `${BRAND_IMAGE_DIR}/jindjan/jindjan-3.jpg` },
    { id: 'jindjan-4', title: 'Comfortable Daily Outfit', price: 6200, description: 'Versatile daily outfit with comfortable fit and easy maintenance. Perfect for everyday activities.', brandId: 'jindjan', image: `${BRAND_IMAGE_DIR}/jindjan/jindjan-4.jpg` },
    { id: 'jindjan-5', title: 'Stylish Casual Set', price: 7200, description: 'Modern casual set with trendy design and comfortable fabric. Ideal for casual outings and daily wear.', brandId: 'jindjan', image: `${BRAND_IMAGE_DIR}/jindjan/jindjan-5.jpg` },

    // Ameena (Affordable)
    { id: 'ameena-1', title: 'Cotton Summer Lawn', price: 2500, description: 'Affordable cotton lawn perfect for hot summer days. Breathable fabric with attractive prints.', brandId: 'ameena', image: `${BRAND_IMAGE_DIR}/ameena/ameena-1.jpg` },
    { id: 'ameena-2', title: 'Basic Trouser Set', price: 1500, description: 'Simple and comfortable trouser set for everyday wear. Budget-friendly with good quality fabric.', brandId: 'ameena', image: `${BRAND_IMAGE_DIR}/ameena/ameena-2.jpg` },
    { id: 'ameena-3', title: 'Simple Daily Wear', price: 1800, description: 'Practical daily wear outfit with comfortable fit and easy maintenance. Great value for money.', brandId: 'ameena', image: `${BRAND_IMAGE_DIR}/ameena/ameena-3.jpg` },
    { id: 'ameena-4', title: 'Affordable Kurta', price: 2200, description: 'Budget-friendly kurta with decent quality and comfortable fabric. Perfect for everyday use.', brandId: 'ameena', image: `${BRAND_IMAGE_DIR}/ameena/ameena-4.jpg` },
    { id: 'ameena-5', title: 'Budget Friendly Dress', price: 1900, description: 'Economical dress option with simple design and comfortable material. Ideal for daily activities.', brandId: 'ameena', image: `${BRAND_IMAGE_DIR}/ameena/ameena-5.jpg` },

    // UIGC Collection (Affordable)
    { id: 'uigc-1', title: 'Everyday Dupatta', price: 1200, description: 'Simple and elegant dupatta for everyday use. Versatile and budget-friendly.', brandId: 'uigc-collection', image: `${BRAND_IMAGE_DIR}/uigc-collection/uigc-1.jpg` },
    { id: 'uigc-2', title: 'Cotton Scarf', price: 950, description: 'Affordable cotton scarf with basic design and comfortable fabric. Perfect for daily use.', brandId: 'uigc-collection', image: `${BRAND_IMAGE_DIR}/uigc-collection/uigc-2.jpg` },
    { id: 'uigc-3', title: 'Simple Casual Dress', price: 1600, description: 'Basic casual dress with comfortable fit and simple design. Great value for everyday wear.', brandId: 'uigc-collection', image: `${BRAND_IMAGE_DIR}/uigc-collection/uigc-3.jpg` },
    { id: 'uigc-4', title: 'Basic Summer Wear', price: 1400, description: 'Light and breathable summer outfit at an affordable price. Perfect for hot weather.', brandId: 'uigc-collection', image: `${BRAND_IMAGE_DIR}/uigc-collection/uigc-4.jpg` },
    { id: 'uigc-5', title: 'Value Cotton Set', price: 1800, description: 'Budget-friendly cotton set with decent quality and comfortable fit. Ideal for daily activities.', brandId: 'uigc-collection', image: `${BRAND_IMAGE_DIR}/uigc-collection/uigc-5.jpg` },

    // Mirakk (Affordable)
    { id: 'mirakk-1', title: 'Casual Kurta Set', price: 1800, description: 'Budget-friendly kurta set with good quality fabric. Perfect for casual occasions.', brandId: 'mirakk', image: `${BRAND_IMAGE_DIR}/mirakk/mirakk-1.jpg` },
    { id: 'mirakk-2', title: 'Everyday Lawn Shirt', price: 800, description: 'Lightweight lawn shirt for daily wear with simple stitching and a comfortable fit.', brandId: 'mirakk', image: `${BRAND_IMAGE_DIR}/mirakk/mirakk-2.jpg` },
    { id: 'mirakk-3', title: 'Basic Cotton Trouser', price: 1100, description: 'Soft cotton trouser with an easy fit, great for everyday use.', brandId: 'mirakk', image: `${BRAND_IMAGE_DIR}/mirakk/mirakk-3.jpg` },
    { id: 'mirakk-4', title: 'Affordable Daily Wear', price: 1500, description: 'Budget-friendly daily wear with comfortable fabric and simple design. Perfect for everyday use.', brandId: 'mirakk', image: `${BRAND_IMAGE_DIR}/mirakk/mirakk-4.jpg` },
    { id: 'mirakk-5', title: 'Value Printed Kurti', price: 1200, description: 'Printed kurti with a relaxed silhouette and everyday comfort.', brandId: 'mirakk', image: `${BRAND_IMAGE_DIR}/mirakk/mirakk-5.jpg` },
  ],
}

localCatalog.items = withFallbackImage(localCatalog.items)

type CatalogSource = 'local' | 'api'

const catalogSource: CatalogSource = 'local'

async function getCatalogFromApi(): Promise<CatalogData> {
  // Placeholder for future FastAPI integration.
  return localCatalog
}

async function getCatalog(): Promise<CatalogData> {
  if (catalogSource === 'api') {
    return getCatalogFromApi()
  }
  return localCatalog
}

export async function getBrandsByCategory(category: CategoryId) {
  const { brands } = await getCatalog()
  return brands.filter((brand) => brand.category === category)
}

export async function getAllBrands() {
  const { brands } = await getCatalog()
  return brands
}

export async function getItemsByBrand(brandId: string) {
  const { items } = await getCatalog()
  return items.filter((item) => item.brandId === brandId)
}

export async function getItemById(itemId: string) {
  const { items } = await getCatalog()
  return items.find((item) => item.id === itemId)
}

export async function getFeaturedItems({
  sort = 'desc',
  limit = 6,
}: {
  sort?: 'desc' | 'asc'
  limit?: number
}) {
  const { items } = await getCatalog()
  const sorted = [...items].sort((a, b) =>
    sort === 'desc' ? b.price - a.price : a.price - b.price,
  )
  return sorted.slice(0, limit)
}

export function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString()}`
}

export function isCategory(value: string): value is CategoryId {
  return value === 'luxury' || value === 'casual' || value === 'cheap'
}

import { createFileRoute } from '@tanstack/react-router'
import ItemDetail from '@/components/ItemDetail'

export const Route = createFileRoute(
  '/category_/$category/brand_/$brand/item/$itemid',
)({
  component: ItemPage,
})

// Placeholder item details - all 45 items
const allItems: Record<string, any> = {
  // MTF (Luxury)
  'mtf-1': { title: 'Elegant Bridal Dress', price: 45000, description: 'A stunning bridal dress crafted with intricate embroidery and premium fabrics. Perfect for your special day, this piece combines traditional elegance with contemporary design.', brand: 'MTF' },
  'mtf-2': { title: 'Luxury Embroidered Shawl', price: 42000, description: 'Exquisite handwoven shawl featuring traditional embroidery and luxurious fabric. A timeless addition to any formal outfit.', brand: 'MTF' },
  'mtf-3': { title: 'Designer Wedding Collection', price: 48000, description: 'Complete wedding ensemble with intricate detailing and premium materials. Designed for those who seek perfection on their special day.', brand: 'MTF' },
  'mtf-4': { title: 'Premium Silk Ensemble', price: 39000, description: 'Pure silk outfit with delicate handwork and elegant draping. Perfect for festive occasions and celebrations.', brand: 'MTF' },
  'mtf-5': { title: 'Royal Festive Wear', price: 46000, description: 'Regal festive collection featuring rich embellishments and traditional craftsmanship. Stand out at any celebration.', brand: 'MTF' },

  // Cosset (Luxury)
  'cosset-1': { title: 'Premium Silk Kurta', price: 38000, description: 'Luxurious silk kurta featuring delicate handwork and modern silhouette. Ideal for formal occasions and celebrations.', brand: 'Cosset' },
  'cosset-2': { title: 'Royal Collection Dress', price: 48000, description: 'Elegant royal dress with intricate embroidery and premium silk fabric. Perfect for formal events and grand celebrations.', brand: 'Cosset' },
  'cosset-3': { title: 'Luxury Evening Gown', price: 52000, description: 'Sophisticated evening gown with contemporary design and traditional embellishments. Make a statement at any formal gathering.', brand: 'Cosset' },
  'cosset-4': { title: 'Designer Party Wear', price: 44000, description: 'Exclusive party wear featuring modern cuts and traditional embroidery. Blend of contemporary style and cultural elegance.', brand: 'Cosset' },
  'cosset-5': { title: 'Exclusive Bridal Set', price: 55000, description: 'Complete bridal collection with matching accessories and premium fabrics. Designed for brides who want perfection.', brand: 'Cosset' },

  // Maria Nasir (Luxury)
  'maria-1': { title: 'Designer Jewelry Set', price: 52000, description: 'Exquisite jewelry set with traditional motifs and modern craftsmanship. Includes necklace, earrings, and matching accessories.', brand: 'Maria Nasir' },
  'maria-2': { title: 'Gold Plated Necklace', price: 55000, description: 'Stunning gold-plated necklace with intricate designs and precious stone embellishments. A timeless piece for special occasions.', brand: 'Maria Nasir' },
  'maria-3': { title: 'Luxury Bridal Jewelry', price: 62000, description: 'Complete bridal jewelry set featuring traditional designs with contemporary flair. Perfect for your wedding day.', brand: 'Maria Nasir' },
  'maria-4': { title: 'Premium Earring Collection', price: 38000, description: 'Elegant earring collection with matching accessories. Handcrafted with attention to detail and quality materials.', brand: 'Maria Nasir' },
  'maria-5': { title: 'Royal Jewelry Ensemble', price: 68000, description: 'Regal jewelry ensemble with traditional craftsmanship and luxurious materials. Make a statement at any event.', brand: 'Maria Nasir' },

  // D&M Collection (Casual)
  'dm-1': { title: 'Contemporary Kurta Set', price: 8500, description: 'Modern kurta set perfect for everyday wear. Comfortable fabric with stylish contemporary design.', brand: 'D&M Collection' },
  'dm-2': { title: 'Modern Casual Wear', price: 7200, description: 'Trendy casual outfit with comfortable fit and stylish design. Perfect for daily wear and casual outings.', brand: 'D&M Collection' },
  'dm-3': { title: 'Stylish Summer Collection', price: 9800, description: 'Light and breezy summer collection with modern prints and comfortable fabric. Stay stylish in the heat.', brand: 'D&M Collection' },
  'dm-4': { title: 'Trendy Office Wear', price: 8900, description: 'Professional office wear with contemporary design and comfortable fit. Look polished and feel comfortable all day.', brand: 'D&M Collection' },
  'dm-5': { title: 'Elegant Daily Dress', price: 7800, description: 'Versatile daily dress with elegant design and easy maintenance. Perfect for busy modern lifestyles.', brand: 'D&M Collection' },

  // Sobia Nazir (Casual)
  'sobia-1': { title: 'Elegant Lawn Collection', price: 12500, description: 'Premium lawn fabric with beautiful prints and elegant design. Perfect for summer occasions.', brand: 'Sobia Nazir' },
  'sobia-2': { title: 'Summer Casual Wear', price: 9500, description: 'Lightweight casual wear with attractive prints and comfortable fabric. Ideal for summer days and casual events.', brand: 'Sobia Nazir' },
  'sobia-3': { title: 'Classic Formal Dress', price: 14000, description: 'Elegant formal dress with classic design and quality fabric. Perfect for semi-formal occasions.', brand: 'Sobia Nazir' },
  'sobia-4': { title: 'Stylish Kurta Set', price: 11000, description: 'Contemporary kurta set with modern embellishments and comfortable fit. Versatile for various occasions.', brand: 'Sobia Nazir' },
  'sobia-5': { title: 'Modern Ethnic Wear', price: 13500, description: 'Fusion of modern style and ethnic design. Perfect for cultural events and festive occasions.', brand: 'Sobia Nazir' },

  // Jindjan (Casual)
  'jindjan-1': { title: 'Casual Everyday Dress', price: 6500, description: 'Comfortable and stylish dress for daily wear. Easy to maintain with modern casual design.', brand: 'Jindjan' },
  'jindjan-2': { title: 'Modern Kurta Collection', price: 7800, description: 'Trendy kurta collection with contemporary design and comfortable fabric. Perfect for daily wear.', brand: 'Jindjan' },
  'jindjan-3': { title: 'Trendy Summer Wear', price: 5900, description: 'Light and comfortable summer outfit with modern prints. Stay cool and stylish in warm weather.', brand: 'Jindjan' },
  'jindjan-4': { title: 'Comfortable Daily Outfit', price: 6200, description: 'Versatile daily outfit with comfortable fit and easy maintenance. Perfect for everyday activities.', brand: 'Jindjan' },
  'jindjan-5': { title: 'Stylish Casual Set', price: 7200, description: 'Modern casual set with trendy design and comfortable fabric. Ideal for casual outings and daily wear.', brand: 'Jindjan' },

  // Ameena (Affordable)
  'ameena-1': { title: 'Cotton Summer Lawn', price: 2500, description: 'Affordable cotton lawn perfect for hot summer days. Breathable fabric with attractive prints.', brand: 'Ameena' },
  'ameena-2': { title: 'Basic Trouser Set', price: 1500, description: 'Simple and comfortable trouser set for everyday wear. Budget-friendly with good quality fabric.', brand: 'Ameena' },
  'ameena-3': { title: 'Simple Daily Wear', price: 1800, description: 'Practical daily wear outfit with comfortable fit and easy maintenance. Great value for money.', brand: 'Ameena' },
  'ameena-4': { title: 'Affordable Kurta', price: 2200, description: 'Budget-friendly kurta with decent quality and comfortable fabric. Perfect for everyday use.', brand: 'Ameena' },
  'ameena-5': { title: 'Budget Friendly Dress', price: 1900, description: 'Economical dress option with simple design and comfortable material. Ideal for daily activities.', brand: 'Ameena' },

  // UIGC Collection (Affordable)
  'uigc-1': { title: 'Everyday Dupatta', price: 1200, description: 'Simple and elegant dupatta for everyday use. Versatile and budget-friendly.', brand: 'UIGC Collection' },
  'uigc-2': { title: 'Cotton Scarf', price: 950, description: 'Affordable cotton scarf with basic design and comfortable fabric. Perfect for daily use.', brand: 'UIGC Collection' },
  'uigc-3': { title: 'Simple Casual Dress', price: 1600, description: 'Basic casual dress with comfortable fit and simple design. Great value for everyday wear.', brand: 'UIGC Collection' },
  'uigc-4': { title: 'Basic Summer Wear', price: 1400, description: 'Light and breathable summer outfit at an affordable price. Perfect for hot weather.', brand: 'UIGC Collection' },
  'uigc-5': { title: 'Value Cotton Set', price: 1800, description: 'Budget-friendly cotton set with decent quality and comfortable fit. Ideal for daily activities.', brand: 'UIGC Collection' },

  // Mirakk (Affordable)
  'mirakk-1': { title: 'Casual Kurta Set', price: 1800, description: 'Budget-friendly kurta set with good quality fabric. Perfect for casual occasions.', brand: 'Mirakk' },
  'mirakk-2': { title: 'Simple Earrings', price: 800, description: 'Affordable earrings with simple design and decent quality. Perfect for everyday wear.', brand: 'Mirakk' },
  'mirakk-3': { title: 'Budget Accessories', price: 1100, description: 'Collection of affordable accessories with basic designs. Great value for money.', brand: 'Mirakk' },
  'mirakk-4': { title: 'Affordable Daily Wear', price: 1500, description: 'Budget-friendly daily wear with comfortable fabric and simple design. Perfect for everyday use.', brand: 'Mirakk' },
  'mirakk-5': { title: 'Value Jewelry Set', price: 1200, description: 'Economical jewelry set with basic design and decent quality. Ideal for casual occasions.', brand: 'Mirakk' },
}

function ItemPage() {
  const { itemid } = Route.useParams()
  const item = allItems[itemid] || {
    title: 'Product Not Found',
    price: 0,
    description: 'This item is currently unavailable.',
    brand: 'Unknown',
  }

  return (
    <ItemDetail
      title={item.title}
      price={item.price}
      description={item.description}
      image="/placeholder.jpg"
      brand={item.brand}
    />
  )
}

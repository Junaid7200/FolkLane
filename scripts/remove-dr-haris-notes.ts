import { getDatabase } from '../src/server/db/client'
import { ensureDatabaseReady } from '../src/server/db/init'

const NOTE_PATTERNS = [
  // Pattern 1: style="color: red" (no semicolon)
  /<p><strong>NOTE: <\/strong><br><span style="color: red">Please note that if you select the stitched option, an advance payment will be required before processing your order\. Once your order is placed, our team will contact you to confirm the details and arrange the advance payment\. Thank you for your understanding and support!<\/span><\/p>/g,
  
  // Pattern 2: style="color: red;" (with semicolon)
  /<p><strong>NOTE: <\/strong><br><span style="color: red;">Please note that if you select the stitched option, an advance payment will be required before processing your order\. Once your order is placed, our team will contact you to confirm the details and arrange the advance payment\. Thank you for your understanding and support!<\/span><\/p>/g,
  
  // Pattern 3: More flexible pattern to catch any variations
  /<p>\s*<strong>NOTE:\s*<\/strong>\s*<br\s*\/?>\s*<span[^>]*>.*?Please note that if you select the stitched option.*?<\/span>\s*<\/p>/gi,
]

async function removeNoteFromDrHarisProducts() {
  console.log('🚀 Starting dr-haris NOTE removal...\n')

  // Ensure database is ready
  await ensureDatabaseReady()
  const db = getDatabase()

  // Fetch all dr-haris products
  const products = db
    .prepare(
      `SELECT id, description 
       FROM products 
       WHERE brand_id = 'dr-haris'`
    )
    .all() as Array<{ id: string; description: string }>

  console.log(`📦 Found ${products.length} dr-haris products`)

  let updatedCount = 0
  const now = new Date().toISOString()

  // Prepare update statement
  const updateStmt = db.prepare(
    `UPDATE products 
     SET description = ?, updated_at = ?
     WHERE id = ?`
  )

  // Process in transaction for safety
  const updateTransaction = db.transaction(() => {
    for (const product of products) {
      let cleanedDescription = product.description

      // Check if this product has a NOTE section
      const hasNote = cleanedDescription.includes('NOTE:') || 
                      cleanedDescription.toLowerCase().includes('please note that if you select the stitched')

      if (!hasNote) {
        continue
      }

      // Remove all NOTE pattern variations
      for (const pattern of NOTE_PATTERNS) {
        cleanedDescription = cleanedDescription.replace(pattern, '')
      }

      // Clean up any double line breaks or extra spaces left behind
      cleanedDescription = cleanedDescription
        .replace(/<\/p>\s*<\/p>/g, '</p>')
        .trim()

      // Only update if description actually changed
      if (cleanedDescription !== product.description) {
        updateStmt.run(cleanedDescription, now, product.id)
        updatedCount++
        console.log(`✓ Cleaned: ${product.id}`)
      }
    }
  })

  try {
    updateTransaction()
    console.log(`\n✅ Successfully updated ${updatedCount} products`)
    console.log(`📊 Total dr-haris products: ${products.length}`)
    console.log(`🎯 Products with NOTE removed: ${updatedCount}`)
    console.log(`⏭️  Products unchanged: ${products.length - updatedCount}`)
  } catch (error) {
    console.error('❌ Error during update:', error)
    throw error
  }

  db.close()
  console.log('\n✨ Database closed. Done!')
}

removeNoteFromDrHarisProducts().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})

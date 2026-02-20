import fs from 'node:fs'
import path from 'node:path'

const NOTE_PATTERNS = [
  // Pattern 1: style=\"color: red\" (no semicolon)
  '<p><strong>NOTE: </strong><br><span style=\\"color: red\\">Please note that if you select the stitched option, an advance payment will be required before processing your order. Once your order is placed, our team will contact you to confirm the details and arrange the advance payment. Thank you for your understanding and support!</span></p>',
  
  // Pattern 2: style=\"color: red;\" (with semicolon)
  '<p><strong>NOTE: </strong><br><span style=\\"color: red;\\">Please note that if you select the stitched option, an advance payment will be required before processing your order. Once your order is placed, our team will contact you to confirm the details and arrange the advance payment. Thank you for your understanding and support!</span></p>',
]

async function cleanCatalogSnapshot() {
  console.log('🚀 Starting catalog.snapshot.json cleanup...\n')

  const filePath = path.resolve(process.cwd(), 'data', 'catalog.snapshot.json')
  
  console.log(`📂 Reading file: ${filePath}`)
  const content = fs.readFileSync(filePath, 'utf8')
  
  console.log(`📝 Original size: ${content.length.toLocaleString()} bytes`)
  
  let cleanedContent = content
  let totalRemovals = 0

  for (const pattern of NOTE_PATTERNS) {
    const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    const matches = cleanedContent.match(regex)
    const count = matches ? matches.length : 0
    
    if (count > 0) {
      console.log(`🔍 Found ${count} instances of pattern: ${pattern.substring(0, 50)}...`)
      cleanedContent = cleanedContent.split(pattern).join('')
      totalRemovals += count
    }
  }

  console.log(`\n📊 Total NOTE sections removed: ${totalRemovals}`)
  console.log(`📝 New size: ${cleanedContent.length.toLocaleString()} bytes`)
  console.log(`🗑️  Bytes removed: ${(content.length - cleanedContent.length).toLocaleString()}`)

  // Write the cleaned content back
  fs.writeFileSync(filePath, cleanedContent, 'utf8')

  console.log('\n✅ catalog.snapshot.json cleaned successfully!')

  // Verify
  const verifyContent = fs.readFileSync(filePath, 'utf8')
  const remainingNotes = (verifyContent.match(/NOTE:/g) || []).length
  
  if (remainingNotes > 0) {
    console.log(`\n⚠️  Warning: ${remainingNotes} instances of "NOTE:" still found (may be from other brands)`)
  } else {
    console.log('\n✨ Verification: No NOTE sections remaining!')
  }
}

cleanCatalogSnapshot().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})

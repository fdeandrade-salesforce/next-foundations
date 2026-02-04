import sharp from 'sharp'
import * as fs from 'fs'
import * as path from 'path'

const QUALITY = 70 // 0.7 quality as requested
const PUBLIC_DIR = path.join(process.cwd(), 'public')

interface CompressionResult {
  file: string
  originalSize: number
  compressedSize: number
  savings: number
  savingsPercent: string
}

async function getImageFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  
  const items = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name)
    
    if (item.isDirectory()) {
      const subFiles = await getImageFiles(fullPath)
      files.push(...subFiles)
    } else if (item.isFile()) {
      const ext = path.extname(item.name).toLowerCase()
      if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
        files.push(fullPath)
      }
    }
  }
  
  return files
}

async function compressImage(filePath: string): Promise<CompressionResult | null> {
  const ext = path.extname(filePath).toLowerCase()
  const originalSize = fs.statSync(filePath).size
  
  try {
    let buffer: Buffer
    
    if (ext === '.png') {
      // For PNG, convert to optimized PNG with compression
      buffer = await sharp(filePath)
        .png({ quality: QUALITY, compressionLevel: 9 })
        .toBuffer()
    } else if (ext === '.jpg' || ext === '.jpeg') {
      // For JPEG, use quality setting
      buffer = await sharp(filePath)
        .jpeg({ quality: QUALITY })
        .toBuffer()
    } else if (ext === '.webp') {
      // For WebP, use quality setting
      buffer = await sharp(filePath)
        .webp({ quality: QUALITY })
        .toBuffer()
    } else {
      return null
    }
    
    const compressedSize = buffer.length
    
    // Only save if we actually reduced the size
    if (compressedSize < originalSize) {
      fs.writeFileSync(filePath, buffer)
      
      return {
        file: path.relative(PUBLIC_DIR, filePath),
        originalSize,
        compressedSize,
        savings: originalSize - compressedSize,
        savingsPercent: ((1 - compressedSize / originalSize) * 100).toFixed(1) + '%'
      }
    } else {
      return {
        file: path.relative(PUBLIC_DIR, filePath),
        originalSize,
        compressedSize: originalSize,
        savings: 0,
        savingsPercent: '0% (kept original)'
      }
    }
  } catch (error) {
    console.error(`Error compressing ${filePath}:`, error)
    return null
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

async function main() {
  console.log('🖼️  Image Compression Script')
  console.log('============================')
  console.log(`Quality: ${QUALITY}%`)
  console.log(`Scanning: ${PUBLIC_DIR}`)
  console.log('')
  
  const imageFiles = await getImageFiles(PUBLIC_DIR)
  console.log(`Found ${imageFiles.length} images to process...\n`)
  
  const results: CompressionResult[] = []
  let totalOriginal = 0
  let totalCompressed = 0
  
  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i]
    const relativePath = path.relative(PUBLIC_DIR, file)
    process.stdout.write(`[${i + 1}/${imageFiles.length}] Compressing ${relativePath}...`)
    
    const result = await compressImage(file)
    
    if (result) {
      results.push(result)
      totalOriginal += result.originalSize
      totalCompressed += result.compressedSize
      
      if (result.savings > 0) {
        console.log(` ✓ Saved ${result.savingsPercent}`)
      } else {
        console.log(` → Already optimized`)
      }
    } else {
      console.log(` ✗ Failed`)
    }
  }
  
  console.log('\n============================')
  console.log('📊 Summary')
  console.log('============================')
  console.log(`Total images processed: ${results.length}`)
  console.log(`Original total size: ${formatBytes(totalOriginal)}`)
  console.log(`Compressed total size: ${formatBytes(totalCompressed)}`)
  console.log(`Total savings: ${formatBytes(totalOriginal - totalCompressed)} (${((1 - totalCompressed / totalOriginal) * 100).toFixed(1)}%)`)
  
  // Show top 10 biggest savings
  const sortedResults = results
    .filter(r => r.savings > 0)
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 10)
  
  if (sortedResults.length > 0) {
    console.log('\n📈 Top 10 Biggest Savings:')
    sortedResults.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.file}: ${formatBytes(r.savings)} saved (${r.savingsPercent})`)
    })
  }
}

main().catch(console.error)

#!/usr/bin/env node

/**
 * Data Layer Audit Script
 * 
 * This script checks for direct imports from /src/data/mock/* in components and pages.
 * Only files inside /src/data/** should import mock data directly.
 * 
 * Usage: node scripts/audit-data-layer.js
 */

const fs = require('fs')
const path = require('path')

const PROJECT_ROOT = path.join(__dirname, '..')
const SRC_DATA_MOCK = path.join(PROJECT_ROOT, 'src', 'data', 'mock')
const ALLOWED_DIRS = [
  'src/data',
  'src/data/mock',
  'src/data/repositories/mock',
  'src/data/providers',
]

// Files to check (components, pages, lib)
const CHECK_DIRS = [
  path.join(PROJECT_ROOT, 'app'),
  path.join(PROJECT_ROOT, 'components'),
  path.join(PROJECT_ROOT, 'lib'),
]

// Patterns to detect direct mock imports
const MOCK_IMPORT_PATTERNS = [
  /from\s+['"]\.\.\/.*\/src\/data\/mock/,
  /from\s+['"]\.\.\/\.\.\/.*\/src\/data\/mock/,
  /from\s+['"]@\/src\/data\/mock/,
  /require\s*\(\s*['"]\.\.\/.*\/src\/data\/mock/,
  /require\s*\(\s*['"]\.\.\/\.\.\/.*\/src\/data\/mock/,
  /import\s+.*\s+from\s+['"]\.\.\/.*mock/,
  /import\s+.*\s+from\s+['"]\.\.\/\.\.\/.*mock/,
]

// Patterns for mock data names
const MOCK_DATA_PATTERNS = [
  /mockProducts/,
  /mockOrders/,
  /mockReviews/,
  /mockUsers/,
  /mockAddresses/,
  /mockPaymentMethods/,
  /mockAdminSettings/,
  /mockFeatureFlags/,
  /mockStorePreferences/,
  /mockStores/,
  /mockGiftCards/,
  /mockStoreCreditHistory/,
]

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)
  
  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, etc.
      if (!file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
        getAllFiles(filePath, fileList)
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(filePath)
    }
  })
  
  return fileList
}

function isAllowedPath(filePath) {
  const relativePath = path.relative(PROJECT_ROOT, filePath)
  return ALLOWED_DIRS.some(allowed => relativePath.startsWith(allowed))
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const issues = []
  
  // Check for direct mock imports
  MOCK_IMPORT_PATTERNS.forEach((pattern, index) => {
    const matches = content.match(pattern)
    if (matches) {
      const lines = content.split('\n')
      const lineNumber = content.substring(0, content.indexOf(matches[0])).split('\n').length
      issues.push({
        type: 'direct_import',
        line: lineNumber,
        match: matches[0],
        pattern: `Pattern ${index + 1}`,
      })
    }
  })
  
  // Check for mock data variable names (but allow in data layer)
  if (!isAllowedPath(filePath)) {
    MOCK_DATA_PATTERNS.forEach(pattern => {
      const matches = content.match(new RegExp(`\\b${pattern.source}\\b`))
      if (matches) {
        const lines = content.split('\n')
        const lineNumber = content.substring(0, content.indexOf(matches[0])).split('\n').length
        // Only flag if it's not a comment
        const lineContent = lines[lineNumber - 1]
        if (lineContent && !lineContent.trim().startsWith('//') && !lineContent.trim().startsWith('*')) {
          issues.push({
            type: 'mock_data_reference',
            line: lineNumber,
            match: matches[0],
            pattern: pattern.source,
          })
        }
      }
    })
  }
  
  return issues
}

function main() {
  console.log('🔍 Auditing data layer isolation...\n')
  
  const allFiles = []
  CHECK_DIRS.forEach(dir => {
    if (fs.existsSync(dir)) {
      getAllFiles(dir, allFiles)
    }
  })
  
  const violations = []
  
  allFiles.forEach(file => {
    if (isAllowedPath(file)) {
      return // Skip files in allowed directories
    }
    
    const issues = checkFile(file)
    if (issues.length > 0) {
      violations.push({
        file: path.relative(PROJECT_ROOT, file),
        issues,
      })
    }
  })
  
  if (violations.length === 0) {
    console.log('✅ No violations found! All data access goes through repositories.\n')
    process.exit(0)
  } else {
    console.log(`❌ Found ${violations.length} file(s) with direct mock data access:\n`)
    
    violations.forEach(({ file, issues }) => {
      console.log(`📁 ${file}`)
      issues.forEach(({ type, line, match, pattern }) => {
        console.log(`   Line ${line}: ${type} - ${match.substring(0, 60)}${match.length > 60 ? '...' : ''}`)
      })
      console.log()
    })
    
    console.log('\n💡 Fix: Use repository functions from @/src/data instead of direct imports.')
    console.log('   Example: import { getProductRepo } from "@/src/data"')
    console.log('   Then: const products = await getProductRepo().getAllProducts()\n')
    
    process.exit(1)
  }
}

main()

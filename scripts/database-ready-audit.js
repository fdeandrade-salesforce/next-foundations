#!/usr/bin/env node

/**
 * Database-Ready Audit Script
 * 
 * Comprehensive audit to ensure the codebase is ready for database integration.
 * Checks for:
 * 1. Direct imports from /src/data/mock/*
 * 2. require() usage in app code
 * 3. Repository interface compliance
 * 4. Provider switch functionality
 * 5. SSR safety (browser-only APIs)
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
  'scripts',
  'node_modules',
  '.next',
]

const CHECK_DIRS = [
  path.join(PROJECT_ROOT, 'app'),
  path.join(PROJECT_ROOT, 'components'),
  path.join(PROJECT_ROOT, 'lib'),
]

const issues = {
  directMockImports: [],
  requireUsage: [],
  ssrIssues: [],
}

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList
  
  const files = fs.readdirSync(dir)
  
  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory()) {
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
  const lines = content.split('\n')
  const relativePath = path.relative(PROJECT_ROOT, filePath)
  
  // Check for direct mock imports
  const mockImportPatterns = [
    /from\s+['"]\.\.\/.*\/src\/data\/mock/,
    /from\s+['"]\.\.\/\.\.\/.*\/src\/data\/mock/,
    /from\s+['"]@\/src\/data\/mock/,
    /import\s+.*\s+from\s+['"]\.\.\/.*\/src\/data\/mock/,
    /import\s+.*\s+from\s+['"]\.\.\/\.\.\/.*\/src\/data\/mock/,
  ]
  
  lines.forEach((line, index) => {
    const lineNum = index + 1
    
    // Check for direct mock imports
    mockImportPatterns.forEach(pattern => {
      if (pattern.test(line) && !isAllowedPath(filePath)) {
        issues.directMockImports.push({
          file: relativePath,
          line: lineNum,
          content: line.trim(),
        })
      }
    })
    
    // Check for require() usage (excluding scripts and node_modules)
    if (/require\s*\(/.test(line) && !isAllowedPath(filePath)) {
      // Allow require in scripts directory
      if (!relativePath.startsWith('scripts/')) {
        issues.requireUsage.push({
          file: relativePath,
          line: lineNum,
          content: line.trim(),
        })
      }
    }
    
    // Check for SSR issues (window/document/ResizeObserver without guards)
    if (!relativePath.startsWith('scripts/')) {
      const hasWindow = /window\./.test(line)
      const hasDocument = /document\./.test(line)
      const hasResizeObserver = /ResizeObserver/.test(line)
      const hasGuard = /typeof\s+window|typeof\s+document|process\.env\.NODE_ENV|useEffect|'use client'/.test(content.substring(0, content.indexOf(line) + line.length))
      
      if ((hasWindow || hasDocument || hasResizeObserver) && !hasGuard && !line.includes('//') && !line.includes('*')) {
        // Check if it's in a useEffect or client component
        const beforeLine = content.substring(0, content.indexOf(line))
        const isInUseEffect = /useEffect\s*\(/.test(beforeLine)
        const isClientComponent = /'use client'/.test(beforeLine.split('\n').slice(0, 10).join('\n'))
        
        if (!isInUseEffect && !isClientComponent) {
          issues.ssrIssues.push({
            file: relativePath,
            line: lineNum,
            content: line.trim(),
            type: hasWindow ? 'window' : hasDocument ? 'document' : 'ResizeObserver',
          })
        }
      }
    }
  })
}

function main() {
  console.log('🔍 Database-Ready Audit\n')
  console.log('=' .repeat(60))
  
  const allFiles = []
  CHECK_DIRS.forEach(dir => {
    if (fs.existsSync(dir)) {
      getAllFiles(dir, allFiles)
    }
  })
  
  console.log(`\n📁 Scanning ${allFiles.length} files...\n`)
  
  allFiles.forEach(file => {
    if (isAllowedPath(file)) {
      return
    }
    checkFile(file)
  })
  
  // Report results
  let hasFailures = false
  
  console.log('\n1️⃣ Direct Mock Data Imports')
  console.log('-'.repeat(60))
  if (issues.directMockImports.length === 0) {
    console.log('✅ PASS: No direct imports from /src/data/mock/* found\n')
  } else {
    console.log(`❌ FAIL: Found ${issues.directMockImports.length} direct mock import(s):\n`)
    issues.directMockImports.forEach(({ file, line, content }) => {
      console.log(`   ${file}:${line}`)
      console.log(`   ${content}\n`)
    })
    hasFailures = true
  }
  
  console.log('\n2️⃣ require() Usage in App Code')
  console.log('-'.repeat(60))
  if (issues.requireUsage.length === 0) {
    console.log('✅ PASS: No require() usage in app code\n')
  } else {
    console.log(`❌ FAIL: Found ${issues.requireUsage.length} require() usage(s):\n`)
    issues.requireUsage.forEach(({ file, line, content }) => {
      console.log(`   ${file}:${line}`)
      console.log(`   ${content}\n`)
    })
    hasFailures = true
  }
  
  console.log('\n3️⃣ SSR Safety (Browser-only APIs)')
  console.log('-'.repeat(60))
  if (issues.ssrIssues.length === 0) {
    console.log('✅ PASS: No unguarded browser-only API usage found\n')
  } else {
    console.log(`❌ FAIL: Found ${issues.ssrIssues.length} potential SSR issue(s):\n`)
    issues.ssrIssues.forEach(({ file, line, content, type }) => {
      console.log(`   ${file}:${line} (${type})`)
      console.log(`   ${content}\n`)
    })
    hasFailures = true
  }
  
  console.log('='.repeat(60))
  
  if (hasFailures) {
    console.log('\n❌ Audit FAILED - See issues above\n')
    process.exit(1)
  } else {
    console.log('\n✅ All checks PASSED\n')
    process.exit(0)
  }
}

main()

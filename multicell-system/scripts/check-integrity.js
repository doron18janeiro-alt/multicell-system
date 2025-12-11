#!/usr/bin/env node

/**
 * Integrity Check Script for multicell-system
 * 
 * This script verifies:
 * 1. All imported files exist in the filesystem
 * 2. Import case matches filesystem case (case-sensitivity check)
 * 3. All referenced pages in routes exist
 * 
 * Run this before building to catch import/path issues early.
 * 
 * Usage: node scripts/check-integrity.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let errorCount = 0;
let warningCount = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  errorCount++;
  log(`❌ ERROR: ${message}`, 'red');
}

function logWarning(message) {
  warningCount++;
  log(`⚠️  WARNING: ${message}`, 'yellow');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

/**
 * Find all JavaScript/JSX files in a directory recursively
 */
function findFiles(dir, extensions = ['.js', '.jsx']) {
  const files = [];
  
  function traverse(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, dist, and hidden directories
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'dist') {
          traverse(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  traverse(dir);
  return files;
}

/**
 * Extract imports from a file
 * Handles: import X from "path", import { X } from "path", import("path")
 */
function extractImports(fileContent, filePath) {
  const imports = [];
  
  // Match static imports: import X from "path" or import { X } from "path"
  const staticImportRegex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = staticImportRegex.exec(fileContent)) !== null) {
    imports.push({
      path: match[1],
      type: 'static',
      line: fileContent.substring(0, match.index).split('\n').length,
    });
  }
  
  // Match dynamic imports: import("path")
  const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  
  while ((match = dynamicImportRegex.exec(fileContent)) !== null) {
    imports.push({
      path: match[1],
      type: 'dynamic',
      line: fileContent.substring(0, match.index).split('\n').length,
    });
  }
  
  return imports;
}

/**
 * Resolve import path to absolute filesystem path
 */
function resolveImportPath(importPath, fromFile) {
  // Handle alias imports (@/)
  if (importPath.startsWith('@/')) {
    const relativePath = importPath.substring(2);
    return path.resolve(projectRoot, 'src', relativePath);
  }
  
  // Handle relative imports
  if (importPath.startsWith('.')) {
    return path.resolve(path.dirname(fromFile), importPath);
  }
  
  // Node modules or other external imports - skip checking
  return null;
}

/**
 * Check if a file exists with correct case
 */
function checkFileExists(filePath) {
  // Try with and without extensions
  const possiblePaths = [
    filePath,
    `${filePath}.js`,
    `${filePath}.jsx`,
    `${filePath}/index.js`,
    `${filePath}/index.jsx`,
  ];
  
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      // Check if case matches
      const dir = path.dirname(testPath);
      const file = path.basename(testPath);
      
      try {
        const actualFiles = fs.readdirSync(dir);
        const caseMatches = actualFiles.includes(file);
        
        return {
          exists: true,
          resolvedPath: testPath,
          caseMatches,
          actualFile: actualFiles.find(f => f.toLowerCase() === file.toLowerCase()),
        };
      } catch (err) {
        return { exists: false };
      }
    }
  }
  
  return { exists: false };
}

/**
 * Check all imports in source files
 */
function checkImports() {
  logInfo('Checking imports...\n');
  
  const srcDir = path.join(projectRoot, 'src');
  const files = findFiles(srcDir);
  
  let checkedImports = 0;
  const issues = [];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const imports = extractImports(content, file);
    const relativeFilePath = path.relative(projectRoot, file);
    
    for (const imp of imports) {
      checkedImports++;
      const resolvedPath = resolveImportPath(imp.path, file);
      
      // Skip external imports (node_modules)
      if (!resolvedPath) continue;
      
      const fileCheck = checkFileExists(resolvedPath);
      
      if (!fileCheck.exists) {
        issues.push({
          type: 'missing',
          file: relativeFilePath,
          line: imp.line,
          import: imp.path,
          resolvedPath,
        });
        logError(
          `${relativeFilePath}:${imp.line} - Import not found: "${imp.path}"`
        );
      } else if (!fileCheck.caseMatches) {
        issues.push({
          type: 'case-mismatch',
          file: relativeFilePath,
          line: imp.line,
          import: imp.path,
          expected: fileCheck.actualFile,
        });
        logWarning(
          `${relativeFilePath}:${imp.line} - Case mismatch: "${imp.path}" (filesystem: "${fileCheck.actualFile}")`
        );
      }
    }
  }
  
  if (issues.length === 0) {
    logSuccess(`All ${checkedImports} imports are valid!\n`);
  } else {
    log(`\n📊 Checked ${checkedImports} imports, found ${issues.length} issues\n`, 'yellow');
  }
  
  return issues.length === 0;
}

/**
 * Check that all pages referenced in routes exist
 */
function checkRoutes() {
  logInfo('Checking routes...\n');
  
  const routesPath = path.join(projectRoot, 'src', 'routes', 'index.jsx');
  
  if (!fs.existsSync(routesPath)) {
    logWarning('Routes file not found at src/routes/index.jsx');
    return true;
  }
  
  const content = fs.readFileSync(routesPath, 'utf-8');
  const lazyImports = extractImports(content, routesPath);
  
  let allValid = true;
  
  for (const imp of lazyImports) {
    if (imp.type === 'dynamic') {
      const resolvedPath = resolveImportPath(imp.path, routesPath);
      if (resolvedPath) {
        const fileCheck = checkFileExists(resolvedPath);
        
        if (!fileCheck.exists) {
          logError(`Route page not found: ${imp.path}`);
          allValid = false;
        } else if (!fileCheck.caseMatches) {
          logWarning(
            `Route case mismatch: ${imp.path} (filesystem: ${fileCheck.actualFile})`
          );
        }
      }
    }
  }
  
  if (allValid) {
    logSuccess('All route pages exist!\n');
  }
  
  return allValid;
}

/**
 * Main execution
 */
function main() {
  log('\n🔍 Running Integrity Check for multicell-system\n', 'blue');
  log('━'.repeat(60), 'blue');
  log('');
  
  const importsValid = checkImports();
  const routesValid = checkRoutes();
  
  log('━'.repeat(60), 'blue');
  log('\n📋 Summary:\n', 'blue');
  
  if (errorCount > 0) {
    log(`   Errors: ${errorCount}`, 'red');
  }
  if (warningCount > 0) {
    log(`   Warnings: ${warningCount}`, 'yellow');
  }
  
  if (errorCount === 0 && warningCount === 0) {
    log('\n🎉 All checks passed! Your codebase is healthy.\n', 'green');
    process.exit(0);
  } else if (errorCount === 0) {
    log('\n✨ No critical errors, but please review warnings.\n', 'yellow');
    process.exit(0);
  } else {
    log('\n❌ Integrity check failed. Please fix the errors above.\n', 'red');
    process.exit(1);
  }
}

main();

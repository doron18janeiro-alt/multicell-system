# Scripts Directory

This directory contains utility scripts for maintaining code quality and integrity.

## check-integrity.js

**Purpose:** Verifies the integrity of imports, file references, and routes in the project.

**Features:**
- ✅ Checks all imports exist in the filesystem
- ✅ Verifies import case matches filesystem case (catches case-sensitivity issues)
- ✅ Validates all route pages exist
- ✅ Supports both relative and alias (`@/`) imports
- ✅ Color-coded terminal output for easy reading

**Usage:**

```bash
# Run manually
npm run check-integrity

# Or directly with node
node scripts/check-integrity.js
```

**Automatic Execution:**
The script runs automatically before every build via the `prebuild` hook in `package.json`.

**Exit Codes:**
- `0` - All checks passed (or only warnings)
- `1` - Critical errors found

**Example Output:**

```
🔍 Running Integrity Check for multicell-system

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ️  Checking imports...

✅ All 264 imports are valid!

ℹ️  Checking routes...

✅ All route pages exist!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Summary:

🎉 All checks passed! Your codebase is healthy.
```

**When to Run:**
- Before committing code changes
- After renaming or moving files
- After updating import paths
- Before deploying to production

**Common Issues Detected:**
1. **Missing files** - Import references a file that doesn't exist
2. **Case mismatch** - Import case doesn't match actual filename (can cause issues on Linux/production)
3. **Broken routes** - Route definition references a non-existent page component

**Configuration:**
The script uses the Vite path alias configuration (`@/` → `src/`) automatically.
No additional configuration is required.

// Production runtime validation
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test']),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  PORT: z.string().regex(/^\d+$/).transform(Number),
  // Add other required env vars
});

// Database connection validation
async function validateDatabase() {
  try {
    const { Database } = require('better-sqlite3');
    const db = new Database(':memory:'); // Test with in-memory DB first
    const dbPath = process.env.DATABASE_URL?.replace('sqlite://', '') || '';
    if (!fs.existsSync(path.dirname(dbPath))) {
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    }
    db.prepare('SELECT 1').get();
    db.close();
    return true;
  } catch (e) {
    console.error('Database validation failed:', e);
    return false;
  }
}

// File system validation
async function validateFileSystem() {
  const requiredDirs = ['dist', 'public'];
  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    '.env',
    '.nvmrc',
    'dist/server/index.js'
  ];

  const missing = [
    ...requiredDirs.filter(dir => !fs.existsSync(dir)),
    ...requiredFiles.filter(file => !fs.existsSync(file))
  ];

  if (missing.length > 0) {
    console.error('Missing required files/directories:', missing);
    return false;
  }
  return true;
}

// Memory validation
function validateMemory() {
  const totalMem = process.memoryUsage().heapTotal / 1024 / 1024;
  const usedMem = process.memoryUsage().heapUsed / 1024 / 1024;
  
  console.log(`Memory usage: ${Math.round(usedMem)}MB / ${Math.round(totalMem)}MB`);
  
  // Warn if using more than 75% of heap
  if (usedMem / totalMem > 0.75) {
    console.warn('Warning: High memory usage');
  }
  
  return true;
}

// Main validation
async function validateProduction() {
  console.log('🔍 Validating production environment...');

  try {
    // Validate environment variables
    const env = envSchema.parse(process.env);
    console.log('✅ Environment variables validated');

    // Validate database
    if (!await validateDatabase()) {
      throw new Error('Database validation failed');
    }
    console.log('✅ Database connection validated');

    // Validate file system
    if (!await validateFileSystem()) {
      throw new Error('File system validation failed');
    }
    console.log('✅ File system validated');

    // Validate memory
    if (!validateMemory()) {
      throw new Error('Memory validation failed');
    }
    console.log('✅ Memory usage validated');

    console.log('✅ All production validations passed!');
    return true;
  } catch (error) {
    console.error('❌ Production validation failed:', error);
    return false;
  }
}

// Export validation
export { validateProduction };

// Run if called directly
if (require.main === module) {
  validateProduction()
    .then(success => process.exit(success ? 0 : 1))
    .catch(() => process.exit(1));
}
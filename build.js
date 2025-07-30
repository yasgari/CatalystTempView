#!/usr/bin/env node

// Custom build script to fix the esbuild configuration
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

console.log('🔨 Building frontend with Vite...');
try {
  // Try npx first, then direct vite command
  try {
    execSync('npx vite build', { stdio: 'inherit' });
  } catch (npxError) {
    console.log('Trying direct vite command...');
    execSync('vite build', { stdio: 'inherit' });
  }
} catch (error) {
  console.error('Frontend build failed:', error.message);
  console.error('Make sure to run "npm install" first to install dependencies.');
  process.exit(1);
}

console.log('🔨 Building backend with esbuild...');
try {
  // Use npx with corrected esbuild options
  execSync('npx esbuild server/index.ts --platform=node --bundle --format=esm --outfile=dist/index.js --external:express --external:dotenv --external:drizzle-orm --external:@neondatabase/serverless --external:passport --external:connect-pg-simple --external:memorystore --external:express-session --external:puppeteer --external:jspdf --external:jspdf-autotable --external:nanoid --external:zod --external:drizzle-zod', { stdio: 'inherit' });
} catch (error) {
  console.error('Backend build failed:', error.message);
  console.error('Make sure to run "npm install" first to install dependencies.');
  process.exit(1);
}

// Fix dotenv import for production
console.log('🔧 Fixing production imports...');
try {
  const serverCode = readFileSync('dist/index.js', 'utf8');
  const fixedCode = serverCode.replace(
    'require("dotenv").config();',
    'import("dotenv").then(dotenv => dotenv.config());'
  );
  writeFileSync('dist/index.js', fixedCode);
} catch (error) {
  console.warn('Could not fix dotenv import (non-critical):', error.message);
}

console.log('✅ Build completed successfully!');
console.log('📁 Frontend: dist/public/');
console.log('📁 Backend: dist/index.js');
console.log('🚀 Run with: npm start');
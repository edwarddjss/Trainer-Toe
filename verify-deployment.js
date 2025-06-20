#!/usr/bin/env node

/**
 * Deployment Verification Script
 * 
 * Run this script before deploying to ensure the codebase is secure and ready.
 * Usage: node verify-deployment.js
 */

const fs = require('fs');

console.log('Trainer Toe Deployment Verification\n');

let issues = 0;

function check(name, test, fix) {
  if (test()) {
    console.log(`✅ ${name}`);
  } else {
    console.log(`❌ ${name}`);
    if (fix) console.log(`   Fix: ${fix}`);
    issues++;
  }
}

// Security Checks
check(
  'No .env file with credentials',
  () => !fs.existsSync('.env'),
  'Remove .env file: rm .env'
);

check(
  'No database with user data',
  () => !fs.existsSync('trainertoe.db'),
  'Remove database: rm trainertoe.db'
);

check(
  'No TTS cache with real data',
  () => !fs.existsSync('tts_cache'),
  'Remove cache: rm -rf tts_cache'
);

// Required Files
check(
  'Environment template exists',
  () => fs.existsSync('.env.example'),
  'Run: cp .env.example.template .env.example'
);

check(
  'README documentation exists',
  () => fs.existsSync('README.md'),
  'Create README.md with setup instructions'
);

check(
  'Git ignores sensitive files',
  () => {
    if (!fs.existsSync('.gitignore')) return false;
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    return gitignore.includes('.env') && gitignore.includes('*.db');
  },
  'Update .gitignore to include .env and *.db'
);

// Build Verification
check(
  'Project builds successfully',
  () => fs.existsSync('dist') && fs.existsSync('dist/index.js'),
  'Run: npm run build'
);

console.log(`\n📊 Results: ${issues === 0 ? '✅ READY' : `❌ ${issues} ISSUES`}`);

if (issues === 0) {
  console.log('\n🚀 Deployment Ready!');
  console.log('Next steps:');
  console.log('1. Set up environment variables in your deployment platform');
  console.log('2. Deploy the application');
  console.log('3. Test with /health command');
} else {
  console.log('\n⚠️  Fix the issues above before deploying');
  process.exit(1);
}
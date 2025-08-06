#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config()

console.log('🚀 Coveralls Local Upload');
console.log('========================');

// Check if coverage file exists
const lcovPath = path.join(process.cwd(), 'coverage', 'lcov.info');
if (!fs.existsSync(lcovPath)) {
  console.log('❌ No coverage file found at: coverage/lcov.info');
  console.log('💡 Run "npm run test:coverage" first to generate coverage');
  process.exit(1);
}

// Check if Coveralls token is available
const hasToken = process.env.COVERALLS_REPO_TOKEN;

if (hasToken) {
  console.log('✅ Coveralls token found - submitting coverage report...');
  try {
    if (process.platform === 'win32') {
      // Windows command
      execSync('type coverage\\lcov.info | npx coveralls', { stdio: 'inherit', shell: true });
    } else {
      // Unix/Linux/Mac command
      execSync('cat coverage/lcov.info | npx coveralls', { stdio: 'inherit' });
    }
    console.log('✅ Coverage successfully submitted to Coveralls!');
    console.log('🔗 Check your coverage at: https://coveralls.io/github/SaddockAime/blogM');
  } catch (error) {
    console.error('❌ Failed to submit to Coveralls:', error.message);
    console.log('💡 Make sure you have run "npm run test:coverage" first');
    process.exit(1);
  }
} else {
  console.log('❌ No Coveralls token found');
  console.log('📊 Coverage report generated locally at: coverage/index.html');
  console.log('');
  console.log('🔧 To upload to Coveralls:');
  console.log('1. Add your token to .env file:');
  console.log('   COVERALLS_REPO_TOKEN=YOUR_TOKEN_HERE');
}

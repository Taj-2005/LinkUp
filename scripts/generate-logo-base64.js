#!/usr/bin/env node

/**
 * Script to generate base64 encoded logo for email templates
 * 
 * Usage:
 *   node scripts/generate-logo-base64.js
 * 
 * This will output the base64 string that you can set as EMAIL_LOGO_BASE64
 * environment variable in your production environment (Vercel, etc.)
 */

const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '..', 'public', 'logo.png');

if (!fs.existsSync(logoPath)) {
  console.error('❌ Logo file not found at:', logoPath);
  process.exit(1);
}

try {
  const logoBuffer = fs.readFileSync(logoPath);
  const base64 = logoBuffer.toString('base64');
  
  console.log('✅ Logo converted to base64 successfully!\n');
  console.log('📋 Copy this value and set it as EMAIL_LOGO_BASE64 in your production environment:\n');
  console.log('─'.repeat(80));
  console.log(base64);
  console.log('─'.repeat(80));
  console.log('\n💡 For Vercel:');
  console.log('   1. Go to your project settings → Environment Variables');
  console.log('   2. Add EMAIL_LOGO_BASE64 with the value above');
  console.log('   3. Redeploy your application\n');
} catch (error) {
  console.error('❌ Error reading logo file:', error.message);
  process.exit(1);
}


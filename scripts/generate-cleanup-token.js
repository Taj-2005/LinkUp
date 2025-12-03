const bcrypt = require('bcryptjs');

const secret = process.argv[2] || process.env.CLEANUP_SECRET;

if (!secret) {
  console.error('Error: CLEANUP_SECRET not provided');
  console.error('\nUsage:');
  console.error('  node scripts/generate-cleanup-token.js <your-secret>');
  console.error('  OR set CLEANUP_SECRET environment variable');
  console.error('\nExample:');
  console.error('  node scripts/generate-cleanup-token.js "my-secret-key-123"');
  process.exit(1);
}

bcrypt.hash(secret, 10)
  .then(hash => {
    console.log('\n✅ Cleanup token generated successfully!\n');
    console.log('Token:', hash);
    console.log('\nUsage:');
    console.log(`GET /api/cleanup/unverified?token=${hash}\n`);
    console.log('cURL example:');
    console.log(`curl "http://localhost:3000/api/cleanup/unverified?token=${hash}"\n`);
  })
  .catch(err => {
    console.error('Error generating token:', err);
    process.exit(1);
  });


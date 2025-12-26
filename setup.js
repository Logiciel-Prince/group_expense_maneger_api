#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setup() {
  console.log('\n🚀 Group Expense Manager Backend Setup\n');
  console.log('This script will help you configure your backend.\n');

  // Check if .env exists
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');

  if (fs.existsSync(envPath)) {
    const overwrite = await question('.env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('\n✅ Setup cancelled. Using existing .env file.\n');
      rl.close();
      return;
    }
  }

  console.log('\n📝 Please provide the following information:\n');

  // Get user input
  const port = await question('Server Port (default: 5000): ') || '5000';
  const nodeEnv = await question('Environment (development/production, default: development): ') || 'development';
  
  console.log('\n🗄️  MongoDB Configuration:');
  const mongoUri = await question('MongoDB URI: ');
  
  console.log('\n🔐 JWT Configuration:');
  const jwtSecret = await question('JWT Secret (leave empty to generate): ');
  const actualJwtSecret = jwtSecret || require('crypto').randomBytes(64).toString('hex');
  const jwtExpires = await question('JWT Expires In (default: 7d): ') || '7d';
  
  console.log('\n🔑 Google OAuth Configuration:');
  const googleClientId = await question('Google Client ID: ') || '84161102992-4tsjoqjtkbh1tio43ob0queft4liakmi.apps.googleusercontent.com';
  const googleClientSecret = await question('Google Client Secret: ');
  
  console.log('\n🌐 CORS Configuration:');
  const allowedOrigins = await question('Allowed Origins (comma-separated, default: http://localhost:19000): ') || 'http://localhost:19000,http://localhost:19001,http://localhost:19002';
  
  console.log('\n⏱️  Rate Limiting:');
  const rateLimitWindow = await question('Rate Limit Window (ms, default: 900000): ') || '900000';
  const rateLimitMax = await question('Max Requests per Window (default: 100): ') || '100';

  // Create .env content
  const envContent = `# Server Configuration
PORT=${port}
NODE_ENV=${nodeEnv}

# MongoDB Atlas
MONGODB_URI=${mongoUri}

# JWT Secret
JWT_SECRET=${actualJwtSecret}
JWT_EXPIRES_IN=${jwtExpires}

# Google OAuth 2.0
GOOGLE_CLIENT_ID=${googleClientId}
GOOGLE_CLIENT_SECRET=${googleClientSecret}

# CORS
ALLOWED_ORIGINS=${allowedOrigins}

# Rate Limiting
RATE_LIMIT_WINDOW_MS=${rateLimitWindow}
RATE_LIMIT_MAX_REQUESTS=${rateLimitMax}
`;

  // Write .env file
  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ .env file created successfully!\n');
  console.log('📋 Summary:');
  console.log(`   - Server Port: ${port}`);
  console.log(`   - Environment: ${nodeEnv}`);
  console.log(`   - MongoDB: ${mongoUri ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`   - JWT Secret: ${actualJwtSecret ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`   - Google OAuth: ${googleClientSecret ? '✓ Configured' : '✗ Not configured'}`);
  console.log('\n🎯 Next Steps:');
  console.log('   1. Review your .env file');
  console.log('   2. Configure Google Cloud Console redirect URI');
  console.log('   3. Run: npm install');
  console.log('   4. Run: npm run dev');
  console.log('\n📚 For detailed instructions, see SETUP_GUIDE.md\n');

  rl.close();
}

setup().catch(console.error);

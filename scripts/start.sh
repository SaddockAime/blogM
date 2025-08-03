#!/bin/sh
set -e

echo "🚀 Starting BlogM Application..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "✅ PostgreSQL is ready!"

# Check current directory and files
echo "📁 Current directory: $(pwd)"
echo "📂 Listing files:"
ls -la

echo "🔍 Checking Sequelize config:"
if [ -f ".sequelizerc" ]; then
  echo "✅ .sequelizerc found"
  cat .sequelizerc
else
  echo "❌ .sequelizerc not found"
fi

if [ -f "src/config/config.js" ]; then
  echo "✅ config.js found"
else
  echo "❌ config.js not found"
  echo "📂 Contents of src/config/:"
  ls -la src/config/ || echo "src/config directory not found"
fi

# Test external Redis connection
echo "🔍 Testing Redis connection..."
if node -e "
const redis = require('redis');
const client = redis.createClient({
  socket: { host: process.env.REDIS_HOST, port: parseInt(process.env.REDIS_PORT) },
  password: process.env.REDIS_PASSWORD,
  database: parseInt(process.env.REDIS_DB)
});
client.connect().then(() => {
  console.log('✅ Redis connection successful!');
  client.disconnect();
}).catch(err => {
  console.error('❌ Redis connection failed:', err.message);
  process.exit(1);
});
"; then
  echo "✅ External Redis is accessible!"
else
  echo "❌ External Redis connection failed!"
  exit 1
fi

echo "🔧 Running database migrations..."
npx sequelize-cli db:migrate --config src/config/config.js

echo "🌱 Seeding database..."
npx sequelize-cli db:seed:all --config src/config/config.js || echo "⚠️ Seeding skipped (data may already exist)"

echo "🎯 Starting the server..."
npm start

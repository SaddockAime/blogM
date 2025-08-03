# BlogM - Blog Management API

A TypeScript Node.js blog management system with authentication, file uploads, email notifications, and real-time features.

## Features

- **User Management**: Registration, login, JWT authentication, Google OAuth
- **Blog Posts**: CRUD operations with image uploads (Cloudinary)
- **Comments & Likes**: Interactive features for user engagement
- **Email Notifications**: Newsletter subscriptions with HTML templates
- **Message Queue**: RabbitMQ for async email processing
- **Database**: PostgreSQL with Sequelize ORM
- **Caching**: Redis for session management
- **Testing**: Jest with comprehensive test coverage
- **Documentation**: Swagger API docs

## Quick Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Redis (or Redis Cloud)
- Gmail account (for SMTP)
- Cloudinary account

### 1. Clone & Install
```bash
git clone <repository-url>
cd blogM
npm install
```

### 2. Environment Setup
Copy and configure environment variables:
```bash
cp .env.example .env
```
Then edit `.env` with your actual credentials (database, Redis, Gmail, Cloudinary, etc.)

### 3. Database Setup
```bash
# Run migrations and seed data
npm run db:migrate
npm run db:seed
```

### 4. Start Development
```bash
npm run dev
```

Visit: http://localhost:5500

## Docker Setup (Recommended)

For easy deployment with PostgreSQL containerized:

```bash
# Start everything (PostgreSQL + App)
npm run docker:up

# Stop everything
npm run docker:down

# View logs
npm run docker:logs
```

This uses your existing cloud services (Redis, Cloudinary, Gmail) while containerizing only the database and app.

## Available Scripts

```bash
# Development
npm run dev              # Start with nodemon
npm run build           # Build TypeScript
npm start              # Start production server

# Database
npm run db:migrate      # Run migrations
npm run db:seed         # Seed test data
npm run db:migrate:undo:all  # Reset database

# Testing
npm test               # Run tests
npm run test:coverage  # Run with coverage report

# Docker
npm run docker:up      # Start containers
npm run docker:down    # Stop containers
npm run docker:logs    # View logs
```

## API Documentation

- **Swagger UI**: http://localhost:5500/api/docs
- **Health Check**: http://localhost:5500/api/health

### Key Endpoints
- `POST /api/v2/auth/register` - User registration
- `POST /api/v2/auth/login` - User login
- `GET /api/v2/blogs` - Get all blogs
- `POST /api/v2/blogs` - Create blog (auth required)
- `POST /api/v2/subscribers/subscribe` - Subscribe to newsletter
- `GET /api/v2/subscribers/unsubscribe` - Unsubscribe

## Message Queue Setup 

RabbitMQ is already configured in your Docker Compose setup. When you run `npm run docker:up`, RabbitMQ starts automatically.

**Current configuration in `.env`:**
```env
RABBITMQ_URL=amqp://admin:admin@rabbitmq:5672
```

**RabbitMQ Management UI**: http://localhost:15672 (admin/admin)

> **Note**: RabbitMQ runs as a Docker service named `rabbitmq` and is accessible to your app container using the service name.

## Testing

```bash
# Run all tests
npm test

# Generate coverage report
npm run test:coverage
```

## Project Structure

```
src/
├── controller/         # Route handlers
├── database/          # Models, migrations, seeders
├── middleware/        # Auth, validation middleware
├── routes/           # API route definitions
├── schemas/          # Validation schemas
├── templates/        # Email templates
├── utils/           # Helper functions
└── __tests__/       # Test files
```

## 🚨 Troubleshooting

**Port already in use**: Kill process using port 5500
**Database connection**: Ensure PostgreSQL is running
**Redis connection**: Check Redis Cloud credentials
**Email not working**: Verify Gmail app password
**Docker issues**: Check Docker daemon is running

---

**Quick Start Summary:**
1. Clone repo → `npm install`
2. Copy `.env.example` to `.env` and add your credentials
3. Run `npm run db:migrate && npm run db:seed`
4. Start with `npm run dev` or `npm run docker:up`
5. Visit http://localhost:5500

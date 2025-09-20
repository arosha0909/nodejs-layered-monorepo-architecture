# Node.js Best Practices Monorepo

A comprehensive Node.js + TypeScript + Express monorepo with MongoDB integration, following industry best practices and clean architecture principles.

## 🏗️ Architecture

This project implements a **layered monorepo architecture** with clear separation of concerns:

### Structure

```
my-system/
├── apps/                    # Business applications
│   ├── orders/             # Orders microservice
│   ├── users/              # Users microservice
│   └── payments/           # Payments microservice
├── libraries/              # Shared libraries
│   ├── logger/             # Centralized logging (Pino)
│   └── authenticator/      # JWT authentication
├── shared/                 # Shared components
│   ├── errors/             # Error handling
│   ├── middleware/         # Express middleware
│   └── db/                 # Database connections
├── config/                 # Configuration management
└── scripts/                # Development scripts
```

### Layer Architecture (per app)

Each application follows a **3-layer architecture**:

1. **`entry-points/api`** - Express controllers, routes, and middleware
2. **`domain`** - Services, DTOs, and core business logic (framework-agnostic)
3. **`data-access`** - Direct MongoDB access (repositories)

## ✨ Features

### Core Features

- ✅ **TypeScript** with strict mode enabled
- ✅ **Express.js** with security middleware
- ✅ **MongoDB** with connection pooling
- ✅ **JWT Authentication** with role-based access
- ✅ **Centralized Logging** with Pino
- ✅ **Error Handling** with custom OperationalError class
- ✅ **Input Validation** with Zod schemas
- ✅ **Environment Configuration** with validation

### Security

- ✅ **Helmet** for security headers
- ✅ **CORS** configuration
- ✅ **Rate Limiting** (basic implementation)
- ✅ **Password Hashing** with bcrypt
- ✅ **JWT Token** validation

### Development

- ✅ **ESLint** + **Prettier** for code quality
- ✅ **Jest** testing framework
- ✅ **GitHub Actions** CI/CD
- ✅ **Hot Reload** development server
- ✅ **TypeScript** path mapping

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 4.4+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd nodejs-best-practices
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**

   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7.0

   # Or start your local MongoDB instance
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

This will start all services:

- **Orders API**: http://localhost:3000
- **Users API**: http://localhost:3001
- **Payments API**: http://localhost:3002

## 📚 API Documentation

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Users API (`/api/users`)

- `POST /register` - Register new user
- `POST /login` - User login
- `GET /profile` - Get current user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `PATCH /deactivate` - Deactivate account

### Orders API (`/api/orders`)

- `POST /` - Create new order
- `GET /` - Get orders (with pagination)
- `GET /:orderId` - Get order by ID
- `PUT /:orderId` - Update order
- `PATCH /:orderId/cancel` - Cancel order
- `GET /stats` - Get order statistics

### Payments API (`/api/payments`)

- `POST /` - Create payment
- `POST /:paymentId/process` - Process payment
- `GET /:paymentId` - Get payment by ID
- `GET /` - Get payments (with pagination)
- `POST /:paymentId/refund` - Process refund
- `GET /stats` - Get payment statistics

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run ci           # Run lint, test, and build
```

### Code Quality

- **ESLint**: Configured for Node.js + TypeScript
- **Prettier**: Code formatting with 1TBS style
- **TypeScript**: Strict mode enabled
- **Jest**: Testing framework with coverage

## 🏭 Production

### Environment Variables

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=my_system

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

LOG_LEVEL=info
LOG_PRETTY=false

CORS_ORIGIN=https://yourdomain.com
```

### Docker Support

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["npm", "start"]
```

## 🏛️ Architecture Principles

### 1. Express Boundaries

- Express exists **only** in `entry-points/api`
- Domain and data-access layers are **framework-agnostic**
- No Express imports in business logic

### 2. Dependency Direction

```
entry-points/api → domain → data-access
```

- Controllers depend on services
- Services depend on repositories
- No reverse dependencies

### 3. Error Handling

- **OperationalError**: Trusted errors sent to client
- **Catastrophic errors**: Logged, generic message to client
- Central error handler middleware

### 4. Configuration

- **Hierarchical**: Environment → Default values
- **Validated**: Zod schema validation
- **Type-safe**: TypeScript interfaces

## 🔒 Security Best Practices

1. **Input Validation**: All inputs validated with Zod
2. **Password Security**: bcrypt with salt rounds
3. **JWT Security**: Secure token generation and validation
4. **CORS**: Configured for specific origins
5. **Rate Limiting**: Basic implementation included
6. **Security Headers**: Helmet middleware
7. **Error Handling**: No sensitive data in error responses

## 📈 Monitoring & Logging

- **Structured Logging**: JSON format with Pino
- **Request Logging**: All HTTP requests logged
- **Error Tracking**: Comprehensive error logging
- **Performance**: Request duration tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

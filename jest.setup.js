// Jest setup file
// Add any global test configuration here

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/test';
process.env.MONGO_DB_NAME = 'test_db';
process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-characters-long';
process.env.JWT_EXPIRES_IN = '7d';
process.env.LOG_LEVEL = 'error';
process.env.LOG_PRETTY = 'false';
process.env.CORS_ORIGIN = 'http://localhost:3000';

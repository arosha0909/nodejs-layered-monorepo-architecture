"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const configSchema = zod_1.z.object({
    app: zod_1.z.object({
        name: zod_1.z.string().default('my-system'),
        version: zod_1.z.string().default('1.0.0'),
        env: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    }),
    server: zod_1.z.object({
        port: zod_1.z.coerce.number().min(1).max(65535).default(3000),
        host: zod_1.z.string().default('localhost'),
    }),
    database: zod_1.z.object({
        mongoUri: zod_1.z.string().min(1, 'MONGO_URI is required'),
        mongoDbName: zod_1.z.string().min(1, 'MONGO_DB_NAME is required'),
    }),
    security: zod_1.z.object({
        jwtSecret: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
        jwtExpiresIn: zod_1.z.string().default('7d'),
    }),
    logging: zod_1.z.object({
        level: zod_1.z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
        pretty: zod_1.z.coerce.boolean().default(true),
    }),
    cors: zod_1.z.object({
        origin: zod_1.z.string().default('http://localhost:3000'),
    }),
});
const rawConfig = {
    app: {
        name: process.env.APP_NAME,
        version: process.env.APP_VERSION,
        env: process.env.NODE_ENV,
    },
    server: {
        port: process.env.PORT,
        host: process.env.HOST,
    },
    database: {
        mongoUri: process.env.MONGO_URI,
        mongoDbName: process.env.MONGO_DB_NAME,
    },
    security: {
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    },
    logging: {
        level: process.env.LOG_LEVEL,
        pretty: process.env.LOG_PRETTY,
    },
    cors: {
        origin: process.env.CORS_ORIGIN,
    },
};
const result = configSchema.safeParse(rawConfig);
if (!result.success) {
    console.error('❌ Configuration validation failed:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
}
exports.config = result.data;
//# sourceMappingURL=environment.js.map
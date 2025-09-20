"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = void 0;
const pino_1 = __importDefault(require("pino"));
const environment_1 = require("@config/environment");
class Logger {
    static instance;
    logger;
    constructor(config) {
        const pinoConfig = {
            level: config.level,
            formatters: {
                level: label => ({ level: label }),
            },
            timestamp: pino_1.default.stdTimeFunctions.isoTime,
        };
        if (config.pretty && process.env.NODE_ENV !== 'production') {
            this.logger = (0, pino_1.default)(pinoConfig, pino_1.default.destination({
                dest: 1,
                sync: false,
            }));
        }
        else {
            this.logger = (0, pino_1.default)(pinoConfig);
        }
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger({
                level: environment_1.config.logging.level,
                pretty: environment_1.config.logging.pretty,
                service: environment_1.config.app.name,
            });
        }
        return Logger.instance;
    }
    info(message, meta) {
        this.logger.info(meta, message);
    }
    error(message, meta) {
        this.logger.error(meta, message);
    }
    warn(message, meta) {
        this.logger.warn(meta, message);
    }
    debug(message, meta) {
        this.logger.debug(meta, message);
    }
    fatal(message, meta) {
        this.logger.fatal(meta, message);
    }
    trace(message, meta) {
        this.logger.trace(meta, message);
    }
    child(bindings) {
        return this.logger.child(bindings);
    }
}
exports.Logger = Logger;
exports.logger = Logger.getInstance();
//# sourceMappingURL=index.js.map
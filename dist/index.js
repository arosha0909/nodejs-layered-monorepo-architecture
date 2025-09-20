"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentsApp = exports.usersApp = exports.ordersApp = void 0;
const environment_1 = require("@config/environment");
const logger_1 = require("@libraries/logger");
logger_1.logger.info('Node.js Best Practices Monorepo', {
    name: environment_1.config.app.name,
    version: environment_1.config.app.version,
    environment: environment_1.config.app.env,
});
__exportStar(require("@libraries/logger"), exports);
__exportStar(require("@libraries/authenticator"), exports);
__exportStar(require("@shared/errors"), exports);
__exportStar(require("@shared/middleware"), exports);
__exportStar(require("@shared/db/mongo"), exports);
__exportStar(require("@config/environment"), exports);
var api_1 = require("@apps/orders/src/entry-points/api");
Object.defineProperty(exports, "ordersApp", { enumerable: true, get: function () { return __importDefault(api_1).default; } });
var api_2 = require("@apps/users/src/entry-points/api");
Object.defineProperty(exports, "usersApp", { enumerable: true, get: function () { return __importDefault(api_2).default; } });
var api_3 = require("@apps/payments/src/entry-points/api");
Object.defineProperty(exports, "paymentsApp", { enumerable: true, get: function () { return __importDefault(api_3).default; } });
//# sourceMappingURL=index.js.map
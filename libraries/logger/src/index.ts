/**
 * @fileoverview Centralized logging library using Pino
 * @author Node.js Best Practices
 */

import pino from 'pino';
import { config } from '@config/environment';

export interface LoggerConfig {
  level: string;
  pretty: boolean;
  service: string;
}

export class Logger {
  private static instance: Logger;
  private logger: pino.Logger;

  private constructor(config: LoggerConfig) {
    const pinoConfig: pino.LoggerOptions = {
      level: config.level,
      formatters: {
        level: label => ({ level: label }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      // service: config.service, // Not supported in this version of Pino
    };

    if (config.pretty && process.env.NODE_ENV !== 'production') {
      this.logger = pino(
        pinoConfig,
        pino.destination({
          dest: 1, // stdout
          sync: false,
        })
      );
    } else {
      this.logger = pino(pinoConfig);
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger({
        level: config.logging.level,
        pretty: config.logging.pretty,
        service: config.app.name,
      });
    }
    return Logger.instance;
  }

  public info(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(meta, message);
  }

  public error(message: string, meta?: Record<string, unknown>): void {
    this.logger.error(meta, message);
  }

  public warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn(meta, message);
  }

  public debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug(meta, message);
  }

  public fatal(message: string, meta?: Record<string, unknown>): void {
    this.logger.fatal(meta, message);
  }

  public trace(message: string, meta?: Record<string, unknown>): void {
    this.logger.trace(meta, message);
  }

  public child(bindings: Record<string, unknown>): pino.Logger {
    return this.logger.child(bindings);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

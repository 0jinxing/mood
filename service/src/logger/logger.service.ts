import { Injectable, Scope, Logger } from '@nestjs/common';
import * as winston from 'winston';

let format = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple()
);

if (process.env.NODE_ENV === 'production') {
  format = winston.format.combine(
    winston.format.uncolorize(),
    winston.format.simple()
  );
}

const logger = winston.createLogger({
  format,
  transports: [new winston.transports.Console()]
});

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends Logger {
  log(message: any, context?: string) {
    logger.info(message, context);
  }

  error(message: any, trace?: string, context?: string) {
    logger.error(message, trace, context);
  }

  warn(message: any, context?: string) {
    logger.warn(message, context);
  }

  debug(message: any, context?: string) {
    logger.debug(message, context);
  }

  verbose(message: any, context?: string) {
    logger.debug(message, context);
  }
}

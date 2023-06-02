import { createLogger, format, transports, Logger } from 'winston';


const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

const logger :Logger = createLogger({
  levels: logLevels,
  format: format.json(),
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new transports.Console({ level: 'info' }),
    // new transports.File({ filename: './logs/error.log', format: format.combine(format.timestamp(), format.json()), level: 'error' }),
    // new transports.File({ filename: './logs/combined.log', format: format.combine(format.timestamp(), format.json()) }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.splat(),
      format.simple(),
    ),
  }));
}
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception: ', err);
});

process.on('unhandledRejection', (reason, p) => {
  logger.error('Unhandled Rejection: Promise: %s, Reason: %s', p, reason);
} );

export default logger;
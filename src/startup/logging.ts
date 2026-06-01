import * as winston from 'winston';
import { MongoDB, MongoDBConnectionOptions } from 'winston-mongodb';

interface ILogger {
  log(): winston.Logger;
}

export default class Logger implements ILogger {
  constructor(
    private db: string | undefined,
    private collection: string,
    private level: string,
  ) {
    if (typeof db !== 'string')
      throw Error(
        `Failed to initialize Logger: Connection string cannot be ${typeof db}`,
      );
  }

  log(): winston.Logger {
    return winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.Console({
          format: winston.format.prettyPrint(),
        }),
      ],
      exceptionHandlers: [
        new winston.transports.File({ filename: './exceptions.log' }),
        new MongoDB({
          db: this.db,
          collection: this.collection,
          level: this.level,
        } as MongoDBConnectionOptions),
      ],
    });
  }
}

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as chalk from 'chalk';

const methodColor = (method: string) => {
  switch (method) {
    case 'GET':
      return chalk.green(method);
    case 'POST':
      return chalk.blue(method);
    case 'PUT':
      return chalk.yellow(method);
    case 'DELETE':
      return chalk.red(method);
    default:
      return chalk.white(method);
  }
};

const statusColor = (status: number) => {
  if (status >= 500) return chalk.red(status);
  if (status >= 400) return chalk.yellow(status);
  if (status >= 300) return chalk.cyan(status);
  return chalk.green(status);
};

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const url = req.originalUrl || req.url;

    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(
        `${methodColor(req.method)} ${url} ${statusColor(res.statusCode)} - ${duration}ms`,
      );
    });

    next();
  }
}

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const requestId = request['requestId'];
    const { method, url, ip } = request;
    const startTime = Date.now();

    this.logger.log(`[${requestId}] Incoming -> ${method} ${url} - IP: ${ip}`);

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        this.logger.log(
          `[${requestId}] Outgoing <- ${statusCode} | ${duration}ms`,
        );
      }),
      catchError((err) => {
        const duration = Date.now() - startTime;
        const statusCode = err.status || 500;

        this.logger.error(
          `[${requestId}] Error <- ${statusCode} | ${duration}ms | Message: ${err.message}`,
        );
        return throwError(() => err);
      }),
    );
  }
}

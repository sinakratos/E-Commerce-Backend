import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  timestamp: string;
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // Already formatted — pass through
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        const statusCode: number = response.statusCode;

        // Extract optional message from controller response
        let message = this.getDefaultMessage(request.method, statusCode);
        let payload = data;

        if (data && typeof data === 'object' && 'message' in data) {
          message = (data as any).message ?? message;
          const { message: _, ...rest } = data as any;
          payload = Object.keys(rest).length ? rest : null;
        }

        return {
          success: true,
          data: payload ?? null,
          message,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private getDefaultMessage(method: string, statusCode: number): string {
    const messages: Record<string, Record<number, string>> = {
      GET: { 200: 'اطلاعات با موفقیت دریافت شد' },
      POST: {
        201: 'رکورد با موفقیت ایجاد شد',
        200: 'عملیات با موفقیت انجام شد',
      },
      PATCH: { 200: 'رکورد با موفقیت به‌روزرسانی شد' },
      PUT: { 200: 'رکورد با موفقیت به‌روزرسانی شد' },
      DELETE: { 200: 'رکورد با موفقیت حذف شد' },
    };

    return messages[method]?.[statusCode] ?? 'عملیات با موفقیت انجام شد';
  }
}

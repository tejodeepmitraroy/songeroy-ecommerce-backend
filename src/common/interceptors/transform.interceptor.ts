import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { ApiResponse } from '../interfaces/api-response.interface.js';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((response: unknown) => {
        if (
          response &&
          typeof response === 'object' &&
          'success' in response &&
          'data' in response
        ) {
          return response as ApiResponse<T>;
        }

        return {
          success: true,
          message: 'Operation successful',
          data: response as T,
        };
      }),
    );
  }
}

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LocalAuthService } from './local-auth.service';

export const localAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(LocalAuthService);
  const token = auth.token;

  if (!token || req.url.includes('/auth/login')) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};

import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const IsAdminGuard: CanMatchFn = async (route: Route, segments: UrlSegment[]) => {
  const authService = inject(AuthService);
  await firstValueFrom(authService.chechStatus());

  if (!authService.isAdmin()) {
    const router = inject(Router);
    router.navigateByUrl('/');
    return false;
  }

  return authService.isAdmin();
};

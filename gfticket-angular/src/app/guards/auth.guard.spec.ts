import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;

  function runGuard() {
    return TestBed.runInInjectionContext(() =>
      authGuard(null as never, null as never),
    );
  }

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('allows access when there is an active session', () => {
    jest.spyOn(authService, 'estaAutenticado').mockReturnValue(true);

    expect(runGuard()).toBe(true);
  });

  it('redirects to /login when there is no active session', () => {
    jest.spyOn(authService, 'estaAutenticado').mockReturnValue(false);
    const loginUrlTree = router.createUrlTree(['/login']);
    jest.spyOn(router, 'parseUrl').mockReturnValue(loginUrlTree);

    const result = runGuard();

    expect(router.parseUrl).toHaveBeenCalledWith('/login');
    expect(result).toBeInstanceOf(UrlTree);
    expect(result).toBe(loginUrlTree);
  });
});

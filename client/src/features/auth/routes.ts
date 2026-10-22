import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';

/** Path builders for auth routes. */
export const authRoutes = {
  login: () => APP_PATHS.login,
  register: () => APP_PATHS.register,
  /** Phone travels in location.state — never in the query string (PII). */
  otp: () => APP_PATHS.otp,
};

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const OtpPage = lazy(() => import('./pages/OtpPage'));

export const authRouteObjects: RouteObject[] = [
  { path: APP_PATHS.login, Component: LoginPage },
  { path: APP_PATHS.register, Component: RegisterPage },
  { path: APP_PATHS.otp, Component: OtpPage },
];

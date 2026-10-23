export {
  useAcceptTermsMutation,
  useDeleteAccountMutation,
  useLazyMeWithTokenQuery,
  useLogoutMutation,
  useMeQuery,
  useRegisterMutation,
  useRequestOtpMutation,
  useUpdateProfileMutation,
  useVerifyOtpMutation,
} from './api/authApi';
export { isValidNational, toE164 } from './lib/phone';
export { guestAuthPath, guestAuthPathSync, isReturningUser, markReturningUser } from './lib/returningUser';
export type {
  RegisterInput,
  RegisterResult,
  RequestOtpInput,
  RequestOtpResult,
  VerifyOtpInput,
  VerifyOtpResult,
} from './model/schemas';
export { authRouteObjects, authRoutes } from './routes';
export { PhoneField } from './ui/PhoneField';
export { TermsAcceptanceGate } from './ui/TermsAcceptanceGate';

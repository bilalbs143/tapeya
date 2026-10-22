import { useMeQuery } from '@/features/auth';

import { useGetPublicSystemSettingsQuery } from '@/shared/api/systemSettingsApi';
import { selectIsAuthenticated } from '@/shared/store/authSlice';
import { useAppSelector } from '@/shared/store/hooks';

import { supportPhoneFromSettings } from '../lib/supportContact';
import { SupportFormBody } from '../ui/SupportFormBody';

/** Support form — POST /support/messages; WhatsApp from `support_phone`. */
export default function SupportPage() {
  const isAuth = useAppSelector(selectIsAuthenticated);
  const { data: me } = useMeQuery(undefined, { skip: !isAuth });
  const { data: settings = [] } = useGetPublicSystemSettingsQuery();
  const phone = supportPhoneFromSettings(settings);

  return <SupportFormBody key={me?.id ?? 'guest'} me={me ?? null} supportPhone={phone} />;
}

import { redirect } from 'next/navigation';

import { APP_ROUTES } from '@/lib/constants';

export default function AuthPage() {
  return redirect(APP_ROUTES.signIn);
}

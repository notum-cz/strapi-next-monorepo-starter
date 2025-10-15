import { getTranslations } from 'next-intl/server';

import { ForgotPasswordForm } from './_components/ForgotPasswordForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function ForgotPasswordPage() {
  const t = await getTranslations('Auth');

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t('forgotPassword')}</CardTitle>
        <CardDescription>{t('forgotPasswordDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  );
}

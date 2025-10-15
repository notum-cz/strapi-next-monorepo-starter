import { getTranslations } from 'next-intl/server';

import { SignInForm } from './_components/SignInForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { APP_ROUTES } from '@/lib/constants';
import { Link } from '@/lib/navigation';

export default async function SignInPage() {
  const t = await getTranslations('Auth');

  return (
    <div className="flex flex-col items-center gap-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t('signIn')}</CardTitle>
          <CardDescription>{t('signInDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm />
        </CardContent>
      </Card>
      <div className="flex w-full max-w-sm items-center gap-4">
        <Separator className="flex-1" />
        <p className="text-xs text-muted-foreground">{t('or')}</p>
        <Separator className="flex-1" />
      </div>
      <p className="text-center text-sm text-muted-foreground">
        {t('dontHaveAccountYet')}{' '}
        <Link href={APP_ROUTES.register} className="underline">
          {t('signUpForFree')}
        </Link>
      </p>
    </div>
  );
}

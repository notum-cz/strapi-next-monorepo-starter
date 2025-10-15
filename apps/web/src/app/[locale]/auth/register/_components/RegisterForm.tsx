'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { AppForm } from '@/components/forms/AppForm';
import { PasswordField } from '@/components/forms/fields/PasswordField';
import { TextField } from '@/components/forms/fields/TextField';
import { Button } from '@/components/ui/button';
import { useTranslatedZod } from '@/hooks/useTranslatedZod';
import { registerWithEmailAndPassword } from '@/lib/firebase-api/auth/client'; // Placeholder

export function RegisterForm() {
  const { tZod } = useTranslatedZod();

  const schema = z.object({
    email: tZod.string().email(),
    password: tZod.string().min(8),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    await registerWithEmailAndPassword(values.email, values.password); // Placeholder
    // TODO: Handle success/error
  };

  return (
    <AppForm
      form={form}
      onSubmit={onSubmit}
      className="flex flex-col items-stretch gap-6"
    >
      <div className="flex flex-col gap-4">
        <TextField control={form.control} name="email" label="Email" />
        <PasswordField
          control={form.control}
          name="password"
          label="Password"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Button type="submit">Create account</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => signIn('google')}
        >
          <GoogleIcon className="mr-2 h-5 w-5" />
          Sign up with Google
        </Button>
      </div>
    </AppForm>
  );
}

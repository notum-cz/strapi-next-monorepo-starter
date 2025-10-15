'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AppForm } from '@/components/forms/AppForm';
import { TextField } from '@/components/forms/fields/TextField';
import { Button } from '@/components/ui/button';
import { useTranslatedZod } from '@/hooks/useTranslatedZod';
import { sendPasswordResetEmail } from '@/lib/firebase-api/auth/client'; // Placeholder

export function ForgotPasswordForm() {
  const { tZod } = useTranslatedZod();

  const schema = z.object({
    email: tZod.string().email(),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    await sendPasswordResetEmail(values.email); // Placeholder
    // TODO: Handle success/error and show a message to the user
  };

  return (
    <AppForm
      form={form}
      onSubmit={onSubmit}
      className="flex flex-col items-stretch gap-6"
    >
      <TextField control={form.control} name="email" label="Email" />

      <Button type="submit">Send reset link</Button>
    </AppForm>
  );
}

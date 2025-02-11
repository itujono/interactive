'use client';

import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './input';
import SelectWithFlag from './select-with-flag';
import { useState } from 'react';

export function UserDetailsForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [values, setValues] = useState({ name: '', country: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Fill in your details to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <section className="grid gap-6">
              <Input
                required
                label="Your name"
                placeholder="Gunawan Sudarsono"
                name="name"
                value={values.name}
                onChange={handleChange}
              />
              <SelectWithFlag
                label="Your country"
                placeholder="United States"
                name="country"
                value={values.country}
                onChange={(value) => setValues({ ...values, country: value })}
                defaultValue={values.country}
              />
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </section>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground [&_a]:hover:text-primary text-center text-xs text-balance [&_a]:underline [&_a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}

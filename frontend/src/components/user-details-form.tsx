'use client';

import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './input';
import SelectWithFlag from './select-with-flag';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { ForwardIcon } from 'lucide-react';

export function UserDetailsForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [values, setValues] = useState({ name: '', country: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_BACKEND_URL || 'ws://localhost:3002');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Control WebSocket Connected');
      const registerMessage = {
        type: 'SCENE_STATUS',
        clientType: 'control',
        status: 'ready',
      };
      ws.send(JSON.stringify(registerMessage));
    };

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.name || !values.country) return;

    setIsSubmitting(true);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'CONTROL_INPUT',
        payload: {
          userDetails: values,
        },
      };
      wsRef.current.send(JSON.stringify(message));

      setValues({ name: '', country: '' });
      toast('Your details sent!', {
        description: `Now open the Display tab to see your name floating in the scene`,
        action: {
          label: (
            <span className="flex items-center gap-1 text-xs">
              Open Display <ForwardIcon className="size-4" />
            </span>
          ),
          onClick: () => {
            window.open(process.env.NEXT_PUBLIC_DISPLAY_URL, 'display-window');
          },
        },
      });
    } else {
      toast.error('Connection error. Please try again.');
    }

    setIsSubmitting(false);
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Fill in your details to see your name floating in the scene</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <section className="grid gap-6">
              <Input
                autoFocus
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
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Continue'}
              </Button>
            </section>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

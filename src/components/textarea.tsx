'use client';

import { Label } from '@/components/ui/label';
import { Textarea as TextareaComponent } from '@/components/ui/textarea';
import { useId } from 'react';

interface TextareaProps extends React.ComponentProps<typeof TextareaComponent> {
  label?: string;
  error?: string;
  helperText?: string;
  defaultValue?: string;
  placeholder?: string;
}

function Textarea({ label, error, helperText, defaultValue, placeholder, ...props }: TextareaProps) {
  const id = useId();
  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <TextareaComponent
        id={id}
        className="border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/20"
        placeholder={placeholder}
        defaultValue={defaultValue}
        {...props}
      />
      {error && (
        <p className="mt-2 text-xs text-destructive" role="alert" aria-live="polite">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="mt-2 text-xs text-muted-foreground" role="alert" aria-live="polite">
          {helperText}
        </p>
      )}
    </div>
  );
}

export { Textarea, type TextareaProps };

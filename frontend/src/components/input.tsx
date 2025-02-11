'use client';

import { useId, useState } from 'react';
import { InputPrimitive } from './ui/input';
import { Label } from './ui/label';
import { cn } from '../lib/utils';
import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.ComponentPropsWithoutRef<'input'> {
  label: string;
  placeholder: string;
  type?: string;
  /** Element to show at the start (text or icon) */
  leading?: React.ReactNode;
  /** Element to show at the end (text or icon) */
  trailing?: React.ReactNode;
  errorMessage?: string;
  helperText?: string;
  className?: string;
}

function Input({
  label,
  placeholder,
  type = 'text',
  leading,
  trailing,
  errorMessage,
  helperText,
  className,
  ...props
}: InputProps) {
  const id = useId();
  const [isVisible, setIsVisible] = useState(false);

  // Helper to check if the addon is an icon (React element) vs text
  const isIconAddon = (addon: React.ReactNode): boolean => {
    return React.isValidElement(addon);
  };

  // For password type, we'll override any trailing addon with the visibility toggle
  const isPassword = type === 'password';
  const effectiveTrailing = isPassword ? undefined : trailing;

  // Determine the effective input type for password fields
  const effectiveType = isPassword ? (isVisible ? 'text' : 'password') : type;

  // Determine padding and styles based on addons and state
  const inputClassName = cn(
    'peer',
    // Addon padding
    leading && (isIconAddon(leading) ? 'ps-9' : 'ps-6'),
    (effectiveTrailing && (isIconAddon(effectiveTrailing) ? 'pe-9' : 'pe-12')) || (isPassword && 'pe-9'),
    // Error styles
    errorMessage &&
      'border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/20',
    className
  );

  // Shared styles for both icons and text addons
  const baseAddonStyles =
    'pointer-events-none absolute inset-y-0 flex items-center justify-center peer-disabled:opacity-50';

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <InputPrimitive id={id} className={inputClassName} placeholder={placeholder} type={effectiveType} {...props} />
        {leading && (
          <span
            className={cn(
              baseAddonStyles,
              'start-0',
              isIconAddon(leading) ? 'text-muted-foreground/80 ps-3' : 'text-muted-foreground ps-3 text-sm'
            )}
          >
            {leading}
          </span>
        )}
        {effectiveTrailing && (
          <span
            className={cn(
              baseAddonStyles,
              'end-0',
              isIconAddon(effectiveTrailing) ? 'text-muted-foreground/80 pe-3' : 'text-muted-foreground pe-3 text-sm'
            )}
          >
            {effectiveTrailing}
          </span>
        )}
        {isPassword && (
          <button
            className="text-muted-foreground/80 hover:text-foreground focus-visible:outline-ring/70 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg outline-offset-2 transition-colors focus:z-10 focus-visible:outline focus-visible:outline-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={() => setIsVisible((prev) => !prev)}
            aria-label={isVisible ? 'Hide password' : 'Show password'}
            aria-pressed={isVisible}
            aria-controls={id}
          >
            {isVisible ? (
              <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Eye size={16} strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {errorMessage && (
        <p className="text-destructive mt-2 text-xs" role="alert" aria-live="polite">
          {errorMessage}
        </p>
      )}
      {!errorMessage && helperText && (
        <p className="text-muted-foreground mt-2 text-xs" role="region" aria-live="polite">
          {helperText}
        </p>
      )}
    </div>
  );
}

export { Input, type InputProps };

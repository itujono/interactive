'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      position="top-right"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:shadow-black/5',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:data-[button]:h-8 group-[.toast]:data-[button]:rounded-xl group-[.toast]:data-[button]:px-3 group-[.toast]:data-[button]:text-xs group-[.toast]:data-[button]:font-medium',
          cancelButton:
            'group-[.toast]:data-[button]:h-8 group-[.toast]:data-[button]:rounded-xl group-[.toast]:data-[button]:px-3 group-[.toast]:data-[button]:text-xs group-[.toast]:data-[button]:font-medium',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

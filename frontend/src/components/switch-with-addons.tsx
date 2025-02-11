'use client';

import { Switch } from './ui/switch';
import { useId, useState } from 'react';

interface SwitchWithAddonsProps {
  label: string;
  leading?: React.ElementType;
  trailing?: React.ElementType;
}

export default function SwitchWithAddons({ label, leading, trailing }: SwitchWithAddonsProps) {
  const id = useId();
  const [checked, setChecked] = useState(false);

  const toggleSwitch = () => setChecked((prev) => !prev);

  const Leading = leading;
  const Trailing = trailing;

  return (
    <div className="group inline-flex items-center gap-2" data-state={checked ? 'checked' : 'unchecked'}>
      {leading && (
        <span
          id={`${id}-off`}
          className="flex-1 cursor-pointer text-right text-sm font-medium group-data-[state=checked]:text-muted-foreground/70"
          aria-controls={id}
          onClick={() => setChecked(false)}
        >
          {Leading && <Leading size={16} strokeWidth={2} aria-hidden="true" />}
        </span>
      )}
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={toggleSwitch}
        aria-labelledby={`${id}-off ${id}-on`}
        aria-label={label}
      />
      {trailing && (
        <span
          id={`${id}-on`}
          className="flex-1 cursor-pointer text-left text-sm font-medium group-data-[state=unchecked]:text-muted-foreground/70"
          aria-controls={id}
          onClick={() => setChecked(true)}
        >
          {Trailing && <Trailing size={16} strokeWidth={2} aria-hidden="true" />}
        </span>
      )}
    </div>
  );
}

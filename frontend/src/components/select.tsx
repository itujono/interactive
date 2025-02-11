'use client';

import { Label } from './ui/label';
import { Select as SelectRoot, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Check, ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '../lib/utils';

type SimpleOption = string;
type ComplexOption = { value: string; label: string; desc?: string };
type BaseOption = SimpleOption | ComplexOption;

interface SelectProps {
  label: string;
  placeholder: string;
  options: BaseOption[];
  helperText?: string;
  searchable?: boolean;
}

function Select({ label, placeholder, options = [], helperText, searchable = false }: SelectProps) {
  const id = useId();

  // State for searchable select
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  // Helper to determine if options are complex (objects vs strings)
  const hasComplexOptions = Array.isArray(options) && options.length > 0 && typeof options[0] !== 'string';

  if (searchable && hasComplexOptions) {
    const complexOptions = options as ComplexOption[];

    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={id}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between bg-background px-3 font-normal outline-offset-0 hover:bg-background focus-visible:border-ring focus-visible:outline-[3px] focus-visible:outline-ring/20"
            >
              <span className={cn('truncate', !value && 'text-muted-foreground')}>
                {value ? complexOptions.find(option => option.value === value)?.label : placeholder}
              </span>
              <ChevronDown size={16} strokeWidth={2} className="shrink-0 text-muted-foreground/80" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0" align="start">
            <Command>
              <CommandInput placeholder={placeholder} />
              <CommandList>
                <CommandEmpty>No options found.</CommandEmpty>
                <CommandGroup>
                  {complexOptions.map(option => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={currentValue => {
                        setValue(currentValue === value ? '' : currentValue);
                        setOpen(false);
                      }}
                    >
                      {option.label}
                      {value === option.value && <Check size={16} strokeWidth={2} className="ml-auto" />}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {helperText && (
          <p className="mt-2 text-xs text-muted-foreground" role="region" aria-live="polite">
            {helperText}
          </p>
        )}
      </div>
    );
  }

  // If we have complex options (objects with value/label), use those
  if (hasComplexOptions) {
    const complexOptions = options as ComplexOption[];
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <SelectRoot defaultValue={complexOptions.length > 0 ? complexOptions[0].value : undefined}>
          <SelectTrigger id={id}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {complexOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
                {option.desc && (
                  <span className="mt-1 block text-xs text-muted-foreground" data-desc>
                    {option.desc}
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
        {helperText && (
          <p className="mt-2 text-xs text-muted-foreground" role="region" aria-live="polite">
            {helperText}
          </p>
        )}
      </div>
    );
  }

  // For simple string options
  const simpleOptions = options as SimpleOption[];
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <SelectRoot defaultValue={simpleOptions.length > 0 ? simpleOptions[0] : undefined}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {simpleOptions.map(option => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
      {helperText && (
        <p className="mt-2 text-xs text-muted-foreground" role="region" aria-live="polite">
          {helperText}
        </p>
      )}
    </div>
  );
}

export { Select };
export type { SelectProps, SimpleOption, ComplexOption, BaseOption };

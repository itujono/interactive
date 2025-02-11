'use client';

import { Button } from './ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Check, ChevronDown } from 'lucide-react';
import { Fragment, useId, useState } from 'react';

const countries = [
  {
    continent: 'America',
    items: [
      { value: 'United States', flag: '🇺🇸' },
      { value: 'Canada', flag: '🇨🇦' },
      { value: 'Mexico', flag: '🇲🇽' },
    ],
  },
  {
    continent: 'Africa',
    items: [
      { value: 'South Africa', flag: '🇿🇦' },
      { value: 'Nigeria', flag: '🇳🇬' },
      { value: 'Morocco', flag: '🇲🇦' },
    ],
  },
  {
    continent: 'Asia',
    items: [
      { value: 'China', flag: '🇨🇳' },
      { value: 'Japan', flag: '🇯🇵' },
      { value: 'Indonesia', flag: '🇮🇩' },
    ],
  },
  {
    continent: 'Europe',
    items: [
      { value: 'United Kingdom', flag: '🇬🇧' },
      { value: 'France', flag: '🇫🇷' },
      { value: 'Germany', flag: '🇩🇪' },
    ],
  },
];

interface SelectWithFlagSearchProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  defaultValue?: string;
  name: string;
}

export default function SelectWithFlagSearch({
  label,
  placeholder,
  value,
  onChange,
  defaultValue,
  name,
}: SelectWithFlagSearchProps) {
  const id = useId();
  const [open, setOpen] = useState(false);

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
            {value ? (
              <span className="flex min-w-0 items-center gap-2">
                <span className="text-lg leading-none">
                  {countries.map((group) => group.items.find((item) => item.value === value)).filter(Boolean)[0]?.flag}
                </span>
                <span className="truncate">{value}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronDown size={16} strokeWidth={2} className="shrink-0 text-muted-foreground/80" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0" align="start">
          <Command value={value} onValueChange={onChange} defaultValue={defaultValue}>
            <CommandInput placeholder={placeholder} name={name} />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              {countries.map((group) => (
                <Fragment key={group.continent}>
                  <CommandGroup heading={group.continent}>
                    {group.items.map((country) => (
                      <CommandItem
                        key={country.value}
                        value={country.value}
                        onSelect={(currentValue) => {
                          onChange(currentValue);
                          setOpen(false);
                        }}
                      >
                        <span className="text-lg leading-none">{country.flag}</span> {country.value}
                        {value === country.value && <Check size={16} strokeWidth={2} className="ml-auto" />}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Fragment>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

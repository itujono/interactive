'use client';

import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { Tabs as TabsPrimitive, TabsList, TabsTrigger } from './ui/tabs';
import { cn } from '../lib/utils';

interface TabsProps {
  children?: React.ReactNode;
  className?: string;
  tabs: {
    value: string;
    label: string;
    icon?: React.ElementType;
  }[];
  onChange: (value: string) => void;
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
}

function Tabs({ children, tabs, className, onChange, defaultValue, value, disabled }: TabsProps) {
  return (
    <TabsPrimitive value={value} defaultValue={defaultValue || undefined} onValueChange={onChange}>
      <ScrollArea>
        <TabsList className={cn('mb-3', className)}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.value} value={tab.value} disabled={disabled}>
                {Icon && <Icon className="-ms-0.5 me-1.5" size={16} strokeWidth={2} aria-hidden="true" />}
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {children}
    </TabsPrimitive>
  );
}

export { Tabs, type TabsProps };

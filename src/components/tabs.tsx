'use client';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs as TabsPrimitive, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface TabsProps {
  children?: React.ReactNode;
  className?: string;
  tabs: {
    value: string;
    label: string;
    icon?: React.ElementType;
  }[];
}

function Tabs({ children, tabs, className }: TabsProps) {
  return (
    <TabsPrimitive defaultValue={tabs[0].value}>
      <ScrollArea>
        <TabsList className={cn('mb-3', className)}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.value} value={tab.value}>
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

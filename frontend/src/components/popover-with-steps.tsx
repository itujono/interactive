'use client';

import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useState } from 'react';

interface StepItem {
  title: string;
  description: string;
}

interface PopoverWithStepsProps {
  steps: StepItem[];
  buttonLabel: string;
}

export default function PopoverWithSteps({ steps, buttonLabel }: PopoverWithStepsProps) {
  const [currentTip, setCurrentTip] = useState(0);

  const handleNavigation = () => {
    if (currentTip === steps.length - 1) {
      setCurrentTip(0);
    } else {
      setCurrentTip(currentTip + 1);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">{buttonLabel}</Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-[280px] py-3 shadow-none" side="top">
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-[13px] font-medium">{steps[currentTip].title}</p>
            <p className="text-xs text-muted-foreground">{steps[currentTip].description}</p>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              {currentTip + 1}/{steps.length}
            </span>
            <button className="text-xs font-medium hover:underline" onClick={handleNavigation}>
              {currentTip === steps.length - 1 ? 'Start over' : 'Next'}
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

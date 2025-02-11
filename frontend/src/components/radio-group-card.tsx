import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useId } from 'react';

interface RadioGroupCardItem {
  label: string;
  sublabel: string;
  value: string;
  description?: string;
}

interface RadioGroupCardProps {
  items: RadioGroupCardItem[];
  id: string;
}

export default function RadioGroupCard({ items, id }: RadioGroupCardProps) {
  return (
    <RadioGroup className="gap-2" defaultValue="1">
      {items.map((item) => (
        <div
          key={`${id}-${item.value}`}
          className="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring"
        >
          <RadioGroupItem
            value={item.value}
            id={`${id}-${item.value}`}
            aria-describedby={`${id}-${item.value}-description`}
            className="order-1 after:absolute after:inset-0"
          />
          <div className="grid grow gap-2">
            <Label htmlFor={`${id}-${item.value}`}>
              {item.label}
              <span className="text-xs font-normal leading-[inherit] text-muted-foreground">{item.sublabel}</span>
            </Label>
            {item.description && (
              <p id={`${id}-${item.value}-description`} className="text-xs text-muted-foreground">
                {item.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </RadioGroup>
  );
}

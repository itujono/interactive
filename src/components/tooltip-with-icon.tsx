import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TooltipWithIconProps {
  buttonLabel: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

export default function TooltipWithIcon({ buttonLabel, icon, children }: TooltipWithIconProps) {
  const Icon = icon;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">
            {buttonLabel}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="dark py-3">
          <div className="flex gap-3">
            <Icon
              className="mt-0.5 shrink-0 opacity-60"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
            {children}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

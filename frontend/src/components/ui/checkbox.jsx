import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
  const handleClick = () => {
    if (onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-gray-700 bg-gray-800 ring-offset-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer flex items-center justify-center transition-all',
        checked && 'bg-gradient-primary border-blue-500',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {checked && <Check className="h-3 w-3 text-white" />}
      <input
        type="checkbox"
        checked={checked}
        onChange={() => {}}
        className="sr-only"
        {...props}
      />
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;


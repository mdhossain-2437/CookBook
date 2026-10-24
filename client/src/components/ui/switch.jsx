import * as React from "react";

import { cn } from "../../lib/utils";

const Switch = React.forwardRef(({ className, onCheckedChange, ...props }, ref) => (
  <input
    {...props}
    ref={ref}
    type="checkbox"
    role="switch"
    onChange={(event) => onCheckedChange?.(event.target.checked)}
    className={cn(
      "peer h-6 w-11 shrink-0 cursor-pointer appearance-none rounded-full bg-gray-300 transition-colors checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 after:ml-0.5 after:mt-0.5 after:block after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-lg after:transition-transform checked:after:translate-x-5",
      className
    )}
  />
));
Switch.displayName = "Switch";

export { Switch };
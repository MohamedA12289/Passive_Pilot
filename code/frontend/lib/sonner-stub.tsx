import * as React from "react";

export const Toaster = React.forwardRef<any, any>(function Toaster({ children, ...props }, ref) {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});

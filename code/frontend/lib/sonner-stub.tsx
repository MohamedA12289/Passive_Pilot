/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import * as React from "react";

export const Toaster = React.forwardRef<any, any>(function Toaster({ children, ...props }, ref) {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});

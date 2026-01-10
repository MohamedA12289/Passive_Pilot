/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import * as React from "react";

export const OTPInputContext = React.createContext<any>(null);

export const OTPInput = React.forwardRef<any, any>(function OTPInput({ children, ...props }, ref) {
  return (
    <OTPInputContext.Provider value={{}}>
      <div ref={ref} {...props}>
        {children}
      </div>
    </OTPInputContext.Provider>
  );
});

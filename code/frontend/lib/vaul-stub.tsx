import * as React from "react";

const Base = React.forwardRef<any, any>(function VaulBase({ children, ...props }, ref) {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});

export const Drawer = Object.assign(Base, {
  Root: Base,
  Trigger: Base,
  Portal: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  Close: Base,
  Overlay: Base,
  Content: Base,
  Title: Base,
  Description: Base,
});

export default Drawer;

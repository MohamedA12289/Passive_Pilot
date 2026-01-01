import * as React from "react";

const Base = React.forwardRef<any, any>(function ResizableBase({ children, ...props }, ref) {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});

export const PanelGroup = Base;
export const Panel = Base;
export const PanelResizeHandle = Base;
export default { PanelGroup, Panel, PanelResizeHandle };

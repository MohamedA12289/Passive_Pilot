/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import * as React from "react";

const Base = React.forwardRef<any, any>(function CommandBase({ children, ...props }, ref) {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});

const Command = Object.assign(Base, {
  Input: Base,
  List: Base,
  Empty: Base,
  Group: Base,
  Item: Base,
  Shortcut: Base,
  Separator: Base,
});

export { Command };
export const CommandInput = Base;
export const CommandList = Base;
export const CommandEmpty = Base;
export const CommandGroup = Base;
export const CommandItem = Base;
export const CommandShortcut = Base;
export const CommandSeparator = Base;
export const CommandDialog = Base;
export default Command;

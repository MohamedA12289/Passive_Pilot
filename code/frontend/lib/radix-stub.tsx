/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import * as React from "react";

const Base = React.forwardRef<any, any>(function RadixStub(
  { asChild, children, ...props }: { asChild?: boolean; children?: React.ReactNode; [key: string]: any },
  ref
) {
  const Component: any = asChild ? React.Fragment : "div";
  return React.createElement(Component as any, { ref, ...props }, children);
});

const PortalStub: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>;
const ProviderStub: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>;

export const Root = Base;
export const Trigger = Base;
export const Content = Base;
export const Overlay = Base;
export const Title = Base;
export const Description = Base;
export const Action = Base;
export const Cancel = Base;
export const Portal = PortalStub;
export const Provider = ProviderStub;
export const Item = Base;
export const ItemIndicator = Base;
export const CheckboxItem = Base;
export const RadioItem = Base;
export const RadioGroup = Base;
export const Sub = Base;
export const SubTrigger = Base;
export const SubContent = Base;
export const Group = Base;
export const Label = Base;
export const Separator = Base;
export const Menu = Base;
export const Link = Base;
export const List = Base;
export const Viewport = Base;
export const ScrollAreaScrollbar = Base;
export const ScrollAreaThumb = Base;
export const Corner = Base;
export const Icon = Base;
export const ItemText = Base;
export const ScrollUpButton = Base;
export const ScrollDownButton = Base;
export const Value = Base;
export const Range = Base;
export const Track = Base;
export const Thumb = Base;
export const Indicator = Base;
export const Image = Base;
export const Fallback = Base;
export const CollapsibleContent = Base;
export const CollapsibleTrigger = Base;
export const SwitchThumb = Base;
export const CheckboxIndicator = Base;
export default Base;

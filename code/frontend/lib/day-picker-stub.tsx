/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import * as React from "react";

export type DateRange = { from?: Date; to?: Date };

export type DayPickerProps = {
  className?: string;
  defaultMonth?: Date;
  selected?: DateRange;
  numberOfMonths?: number;
  onSelect?: (range: DateRange | undefined) => void;
  [key: string]: any;
};

export function DayPicker({ className, onSelect, ...props }: DayPickerProps) {
  const handleClick = () => onSelect?.(props.selected);
  return <div className={className} onClick={handleClick} {...props} />;
}

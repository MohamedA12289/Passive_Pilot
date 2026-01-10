/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
export function format(date: Date, _fmt: string): string {
  return date.toISOString();
}

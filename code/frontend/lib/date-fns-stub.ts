export function format(date: Date, _fmt: string): string {
  return date.toISOString();
}

export class jsPDF {
  internal = {
    pageSize: {
      getWidth: () => 0,
      getHeight: () => 0,
    },
  };

  constructor(..._args: any[]) {}
  text(_text: string, _x: number, _y: number, _options?: any) {}
  save(_name?: string) {}
  setFontSize(_size: number) {}
  setFont(_family: string, _style?: string) {}
  setTextColor(_r: number, _g?: number, _b?: number) {}
  splitTextToSize(text: string, _size: number): string[] {
    return Array.isArray(text) ? (text as any) : [text];
  }
  setDrawColor(_r: number, _g?: number, _b?: number) {}
  setLineWidth(_width: number) {}
  line(_x1: number, _y1: number, _x2: number, _y2: number) {}
  addPage() {}
  getCurrentPageInfo() {
    return { pageNumber: 1 } as const;
  }
}

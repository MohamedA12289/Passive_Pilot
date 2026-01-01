import * as React from "react";

export type CarouselApi = {
  canScrollPrev: () => boolean;
  canScrollNext: () => boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  on: (event: string, cb: (api: CarouselApi) => void) => void;
  off: (event: string, cb: (api: CarouselApi) => void) => void;
};

export type EmblaOptionsType = Record<string, unknown>;
export type EmblaPluginType = unknown;

export type UseEmblaCarouselType = [
  (node: HTMLElement | null) => void,
  CarouselApi
];

const noop = () => {};
const api: CarouselApi = {
  canScrollPrev: () => false,
  canScrollNext: () => false,
  scrollPrev: noop,
  scrollNext: noop,
  on: (_event: string, cb: (api: CarouselApi) => void) => cb(api),
  off: noop,
};

export default function useEmblaCarousel(
  _options?: EmblaOptionsType,
  _plugins?: EmblaPluginType
): UseEmblaCarouselType {
  const refCallback = React.useCallback((node: HTMLElement | null) => {
    // no-op stub
  }, []);
  return [refCallback, api];
}

const IMAGES: Record<string, string | undefined> = {};

export function preloadImage(name: string, src: string) {
  return fetch(src)
    .then((res) => res.blob())
    .then((x) => (IMAGES[name] = URL.createObjectURL(x)))
    .catch(console.warn);
}

export function preloadImages(sources: string[]) {
  sources = sources.filter((x) => !IMAGES[x]);

  return Promise.allSettled(sources.map((src) => preloadImage(src, src)));
}

export function setCachedImageName(name: string, src: string) {
  IMAGES[name] = getCachedImage(src);
}

export function getCachedImage(src: string) {
  // console.log("[cache]:", src);

  return IMAGES[src];
}

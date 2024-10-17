import React from "react";
import { getCachedImage } from "../lib/image-cache";

export function CachedImage(props: React.ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  const src = getCachedImage(props.src) ?? props.src;

  return <img {...props} src={src} />;
}

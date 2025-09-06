/**
 * Asset management utility for preloading and validating game assets
 */

import { Logger } from "./logger";

export interface AssetLoadResult {
  successful: string[];
  failed: number;
  total: number;
}

export interface AssetProxy {
  [key: string]: string;
}

/**
 * Create a proxy for assets that provides warnings for missing/unloaded assets
 */
export function createAssetProxy(assets: Record<string, string>, logger: Logger): AssetProxy {
  return new Proxy(assets, {
    get: (target, prop: string) => {
      if (!target[prop]) {
        logger.warn(`Missing asset ${prop}:${target[prop]}`);
      } else if (!target[prop].startsWith("blob:")) {
        logger.warn(`Asset ${prop}:${target[prop]} is not preloaded`);
      }

      return target[prop];
    },
    set: (target, prop: string, newValue) => {
      if (!newValue.startsWith("blob:")) {
        logger.warn(`Can't update asset ${prop} with ${newValue}`);
        return false;
      } else {
        target[prop] = newValue;
        return true;
      }
    },
    getPrototypeOf() {
      return assets;
    },
  });
}

/**
 * Validate if content type matches expected file extension
 */
export function validateAssetContentType(extension: string | undefined, contentType: string): boolean {
  if (!extension) return true; // Can't validate without extension

  const typeMap: Record<string, string[]> = {
    png: ["image/png"],
    jpg: ["image/jpeg"],
    jpeg: ["image/jpeg"],
    gif: ["image/gif"],
    webp: ["image/webp"],
    svg: ["image/svg+xml"],
    mp3: ["audio/mpeg", "audio/mp3"],
    wav: ["audio/wav", "audio/wave"],
    ogg: ["audio/ogg"],
    mp4: ["video/mp4"],
    webm: ["video/webm"],
    json: ["application/json", "text/json"],
  };

  const expectedTypes = typeMap[extension];
  return !expectedTypes || expectedTypes.some((type) => contentType.includes(type));
}

/**
 * Preload assets and convert them to blob URLs
 */
export async function preloadAssets(
  assets: Record<string, string>,
  assetsBasePath: string,
  logger: Logger
): Promise<AssetLoadResult> {
  const results = await Promise.allSettled(
    Object.entries(assets)
      .filter(([_name, src]) => !src.startsWith("blob:"))
      .map(([name, src]) =>
        fetch(assetsBasePath + src)
          .then((res) => {
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}: Failed to fetch asset '${name}' from '${src}'`);
            }

            // Validate content type for common asset types
            const contentType = res.headers.get("content-type");
            if (contentType) {
              const extension = src.split(".").pop()?.toLowerCase();
              const isValidType = validateAssetContentType(extension, contentType);
              if (!isValidType) {
                logger.warn(
                  `Asset '${name}' content-type '${contentType}' may not match file extension '${extension}'`
                );
              }
            }

            return res.blob();
          })
          .then((blob) => {
            assets[name] = URL.createObjectURL(blob);
            logger.debug(`Successfully loaded asset: ${name}`);
            return { name, success: true };
          })
          .catch((error) => {
            logger.warn(`Failed to load asset '${name}':`, error.message);
            return { name, success: false, error: error.message };
          })
      )
  );

  const failed = results
    .filter((result): result is PromiseRejectedResult => result.status === "rejected")
    .map((result) => result.reason);

  const successful = results
    .filter(
      (result): result is PromiseFulfilledResult<{ name: string; success: boolean }> =>
        result.status === "fulfilled" && result.value.success
    )
    .map((result) => result.value.name);

  logger.debug(`Asset loading complete: ${successful.length} successful, ${failed.length} failed`);

  if (failed.length > 0) {
    logger.warn(`Some assets failed to load:`, failed);
  }

  return {
    successful,
    failed: failed.length,
    total: Object.keys(assets).length,
  };
}

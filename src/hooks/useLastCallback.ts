import { useCallback } from "react";

import { useStateRef } from "./useStateRef";

export function useLastCallback<T extends () => void>(callback?: T) {
  const ref = useStateRef(callback);

  return useCallback(
    (...args: Parameters<T>) =>
      // @ts-ignore
      ref.current?.(...args),
    []
  ) as T;
}

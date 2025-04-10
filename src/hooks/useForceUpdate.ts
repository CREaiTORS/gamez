import { useCallback, useState } from "react";

export function useForceUpdate() {
  const [, setState] = useState(true);
  return useCallback(() => {
    setState((s) => !s);
  }, []);
}

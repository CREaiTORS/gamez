import { useState } from "react";

export function useResult<T extends string = string>(cb = (_: T) => {}) {
  const [result, setResult] = useState("");

  return {
    result: result as T,
    setResult(x: T) {
      if (result) return result;

      cb(x);
      setResult(x);
    },
    resetResult() {
      setResult("");
    },
  };
}

import { useCallback, useState } from "react";
import { ResultType } from "../types";

export function useResult<T extends string = ResultType>(cb = (_: T) => {}) {
  const [result, setResult] = useState("");

  return {
    result: result as T,
    setResult: useCallback(
      (x: T) => {
        if (result) return;
        cb(x), setResult(x);
      },
      [result]
    ),
    resetResult: useCallback(() => setResult(""), []),
  };
}

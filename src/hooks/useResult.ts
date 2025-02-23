import { useState } from "react";
import { ResultType } from "../types";

export function useResult<T extends string = ResultType>(cb = (_: T) => {}) {
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

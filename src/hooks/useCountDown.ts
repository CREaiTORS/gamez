import React from "react";
import { useLastCallback } from "./useLastCallback";

export function useCountDown(initialValue = 10, cb?: () => void, disabled = false) {
  const [countDown, setCountDown] = React.useState(initialValue);
  const callback = useLastCallback(cb);

  React.useEffect(() => {
    if (disabled) return;

    const countDownrId = setTimeout(() => {
      if (countDown <= 1) {
        callback();
      } else {
        setCountDown(countDown - 1);
      }
    }, 1000);

    return () => clearInterval(countDownrId);
  }, [disabled, countDown]);

  return { countDown };
}

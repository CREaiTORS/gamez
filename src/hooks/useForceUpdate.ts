import { useState } from "react";

export const useForceUpdate = () => {
  const [key, render] = useState(1);

  return () => render(key * -1);
};

import { useCallback, useState } from "react";
import { ComponentRefreshContext } from "../contexts/component-refresh-context";

export function ComponentRefresh({ children }: React.PropsWithChildren) {
  const [key, setKey] = useState(1);
  const onRefresh = useCallback(() => setKey((x) => x * -1), []);

  return (
    <ComponentRefreshContext.Provider key={key} value={{ onRefresh }}>
      {children}
    </ComponentRefreshContext.Provider>
  );
}

export function wrapWithComponentRefresh(Component: React.FC) {
  return (
    <ComponentRefresh>
      <Component />
    </ComponentRefresh>
  );
}

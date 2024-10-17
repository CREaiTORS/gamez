import { createContext, useContext, useState } from "react";

const Context = createContext({ onRefresh: () => {} });

export function ComponentRefresh({ children }: React.PropsWithChildren) {
  const [key, setKey] = useState(1);

  return (
    <Context.Provider key={key} value={{ onRefresh: () => setKey(key * -1) }}>
      {children}
    </Context.Provider>
  );
}

export const useComponentRefresh = () => useContext(Context).onRefresh;

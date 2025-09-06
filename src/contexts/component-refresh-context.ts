import { createContext, useContext } from "react";

export const ComponentRefreshContext = createContext({
  onRefresh: () => {
    console.warn("Your component is not child of ComponentRefresh");
  },
});

export const useComponentRefresh = () => useContext(ComponentRefreshContext).onRefresh;

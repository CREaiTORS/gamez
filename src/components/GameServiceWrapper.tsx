import { createContext, useContext } from "react";
import { GameService } from "..";

export interface GameServiceProps {
  gs: GameService;
}

const Context = createContext({} as GameServiceProps);

export function GameServiceWrapper({ children, gs }: React.PropsWithChildren & GameServiceProps) {
  return <Context.Provider value={{ gs }}>{children}</Context.Provider>;
}

export const useGameService = () => useContext(Context).gs;

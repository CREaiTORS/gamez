import { createContext, useContext } from "react";
import { GameService } from "..";

export interface GameServiceProps {
  gs: GameService;
}

export const GSContext = createContext({} as GameServiceProps);

export const useGameService = () => useContext(GSContext).gs;

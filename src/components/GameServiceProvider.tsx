import { GameServiceProps, GSContext } from "../contexts/game-service-context";

export function GameServiceProvider({ children, gs }: React.PropsWithChildren & GameServiceProps) {
  return <GSContext.Provider value={{ gs }}>{children}</GSContext.Provider>;
}

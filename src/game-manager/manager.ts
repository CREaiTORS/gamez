import { GameService } from "./game-service";

export class Manager<T extends string = string> {
  gamesService: Record<T, GameService>;

  constructor() {
    this.gamesService = {} as any;
  }

  getGameService(name: T) {
    if (this.gamesService[name]) return this.gamesService[name];

    throw new Error(`Game '${name}' is not added.`);
  }

  addGameService(name: T, game: GameService) {
    this.gamesService[name] = game;
  }

  removeGameService(name: T) {
    delete this.gamesService[name];
  }

  preloadGamesAssets() {
    return Promise.allSettled((Object.values(this.gamesService) as GameService[]).map((game) => game.preloadAssets()));
  }

  getResults() {
    const results: Record<T, any> = {} as any;

    for (const [name, gameService] of Object.entries<GameService>(this.gamesService)) {
      results[name as T] = gameService.getResults();
    }

    return results;
  }
}

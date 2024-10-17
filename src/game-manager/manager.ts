import { GameService } from "./game-service";

export class Manager<T extends string = string> {
  gamesService: Record<T, GameService>;

  constructor() {
    this.gamesService = {} as any;
  }

  getGame(name: T) {
    if (this.gamesService[name]) return this.gamesService[name];

    throw new Error(`Game '${name}' is not added.`);
  }

  getAllGames() {
    return Object.values(this.gamesService) as GameService[];
  }

  addGame(name: T, game: GameService) {
    this.gamesService[name] = game;
  }

  removeGameService(name: T) {
    delete this.gamesService[name];
  }

  preloadGamesAssets() {
    return Promise.allSettled(this.getAllGames().map((game) => game.preloadAssets()));
  }

  getResults() {
    const results: Record<T, any> = {} as any;

    for (const [name, gameService] of Object.entries<GameService>(this.gamesService)) {
      results[name as T] = gameService.getResults();
    }

    return results;
  }
}

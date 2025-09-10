import { CommunicationHub } from "./hub";

/**
 * Global communication hub store
 * Provides singleton access to the communication hub instance
 */
class CommunicationHubStore {
  private hubInstance: CommunicationHub | null = null;

  /**
   * Creates and stores a new communication hub instance
   * @param constructorArgs - Arguments to pass to CommunicationHub constructor
   * @returns The created hub instance
   */
  createHub(...constructorArgs: ConstructorParameters<typeof CommunicationHub>): CommunicationHub {
    this.hubInstance = new CommunicationHub(...constructorArgs);
    return this.hubInstance;
  }

  /**
   * Gets the current communication hub instance
   * @returns The hub instance
   * @throws Error if no hub has been created
   */
  getHub(): CommunicationHub {
    if (!this.hubInstance) {
      throw new Error("Communication hub not initialized. Call createCommunicationHub() first.");
    }
    return this.hubInstance;
  }

  /**
   * Checks if a hub instance exists
   */
  hasHub(): boolean {
    return this.hubInstance !== null;
  }

  /**
   * Clears the current hub instance
   */
  clearHub(): void {
    if (this.hubInstance) {
      this.hubInstance.terminateCommunication();
    }
    this.hubInstance = null;
  }
}

/**
 * Singleton store instance
 */
const communicationHubStore = new CommunicationHubStore();

/**
 * Creates a new communication hub and stores it globally
 * @param constructorArgs - Arguments to pass to CommunicationHub constructor
 * @returns The created hub instance
 */
export function createCommunicationHub(
  ...constructorArgs: ConstructorParameters<typeof CommunicationHub>
): CommunicationHub {
  return communicationHubStore.createHub(...constructorArgs);
}

/**
 * Gets the global communication hub instance
 * @returns The hub instance
 * @throws Error if no hub has been created
 */
export function getCommunicationHub(): CommunicationHub {
  return communicationHubStore.getHub();
}

/**
 * Checks if a communication hub has been created
 */
export function hasCommunicationHub(): boolean {
  return communicationHubStore.hasHub();
}

/**
 * Clears the global communication hub instance
 */
export function clearCommunicationHub(): void {
  communicationHubStore.clearHub();
}

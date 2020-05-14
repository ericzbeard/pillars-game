import { GameState, SerializedGameState } from './game-state';
import { PillarsSounds } from './sounds';
import { Database } from './database';
import { Player } from './player';
import { IGame } from './interfaces/game';
import { ICardContainer } from './interfaces/card-container';


/**
 * This is the server-side equivalent of PillarsGame.
 */
export class ServerGame implements IGame {
    
    constructor(public gameState: GameState, 
        private database: Database) {}

    /**
     * Broadcast a game state change to all clients.
     */
    async broadcast(message:string): Promise<any> {

        // Increment the version
        this.gameState.version++;

        // Save the changes
        await this.database.gameUpdate(new SerializedGameState(this.gameState));

        // Send a chat message
        await this.database.chatAdd(this.gameState.id, message);

        // TODO - websockets
    }

    async chat(msg: string) {
        const player = this.gameState.currentPlayer;
        await this.database.chatAdd(this.gameState.id, msg);
    }

    // We'll need websockets to send the below signals out while
    // AI is taking a turn and we want to animate or play a sound.

    /**
     * Send a signal to all clients to animate talent addition.
     */
    async animateTalent(mcard:ICardContainer, n:number) {

    }

    /**
     * Send a signal to all clients to animate creativity addition.
     */
    async animateCreativity(mcard:ICardContainer, n:number) {

    }

    /**
     * Send a signal to all clients to animate credit addition.
     */
    async animateCredits(mcard:ICardContainer, n:number) {

    }

    /**
     * Send a signal to all clients to animate customer addition.
     */
    async animateCustomer(mcard:ICardContainer, n:number) {

    }

    /**
     * Send a signal to all clients to play a sound.
     */
    async playSound(fileName:string) {

    }

    /**
     * End the turn.
     */
    async endTurn() {
        const player = this.gameState.currentPlayer;

        await this.broadcast(`${player.name} ended their turn.`);

        if (!this.gameState.nextPlayer()) {
            // Game over!
            // TODO
            return false;
        }

        const nextPlayer = this.gameState.currentPlayer;

        await this.broadcast(`It's ${nextPlayer.name}'s turn now.`);

        return true;
    }
}

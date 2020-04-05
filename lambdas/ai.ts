import { GameState } from './game-state';
import { Player } from './player';

export type BroadcastFunction = (message:string) => any;

/**
 * AI Player Logic.
 */
export class AI {

    constructor(
        private player:Player, 
        private gameState:GameState, 
        private broadcast: BroadcastFunction) {}

    /**
     * Wait ms.
     * 
     * e.g. await this.timeout(500);
     */
    timeout(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Take actions on the AI player's turn.
     */
    async takeTurn(endTurn: Function) {

        this.broadcast(`[${this.player.name}] It's my turn! Hooray!`);

        await this.timeout(2000);

        this.broadcast('Thinking...');

        await this.timeout(2000);

        this.broadcast("Ok, I'm done. Time to face a trial.");

        this.gameState.endTrial(this.gameState.trialStacks[0], false, 6);

        endTurn();
    }
}
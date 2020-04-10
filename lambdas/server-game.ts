import { Card } from './card';
import { GameState, SerializedGameState } from './game-state';
import { PillarsSounds } from './sounds';
import { ICardContainer, IGame, ICustomActions } from './card-actions';
import { IStandardActions, CustomEffect } from './card-actions';
import { Database } from './database';


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

    // We'll need websockets to send the below signals out while
    // AI is taking a turn and we want to animate or play a sound.

    /**
     * Send a signal to all clients to animate talent addition.
     */
    animateTalent(mcard:ICardContainer, n:number):any {

    }

    /**
     * Send a signal to all clients to animate creativity addition.
     */
    animateCreativity(mcard:ICardContainer, n:number):any {

    }

    /**
     * Send a signal to all clients to animate credit addition.
     */
    animateCredits(mcard:ICardContainer, n:number):any {

    }

    /**
     * Send a signal to all clients to animate customer addition.
     */
    animateCustomer(mcard:ICardContainer, n:number):any {

    }

    /**
     * Send a signal to all clients to play a sound.
     */
    playSound(fileName:string):any {

    }
}

/**
 * Card action server side, used by AI.
 */
export class StandardServerActions implements IStandardActions {

    /**
     * Remove a card in hand from the game.
     */
    retireCardFromHand(game: IGame, mcard: ICardContainer, callback?: Function) {
    }

    /**
     * Promote (or demote)
     * 
     * Roll a d6 and promote that pillar, unless it's maxed.
     * 
     * On a 6, choose a non-maxed pillar to promote.
     */
    promote(game: IGame, callback?: Function, isDemote?: boolean) {

        if (isDemote === undefined) {
            isDemote = false;
        }

    }

     /**
     * Promote (or demote) any pillar.
     * 
     * Choose a non-maxed pillar to promote.
     */
    promoteAny(game: IGame, callback?: Function, isDemote?: boolean) {

        if (isDemote === undefined) {
            isDemote = false;
        }

    }
}

/**
 * Custom server card actions, used by AI.
 */
export class CustomServerActions implements ICustomActions {
    customEffects: Map<string, CustomEffect>;

    constructor() {
        this.customEffects = new Map<string, CustomEffect>();
    }

    /**
     * Get the custom effect by name.
     */
    get(key:string): CustomEffect {
        return <CustomEffect>this.customEffects.get(key);
    }

}
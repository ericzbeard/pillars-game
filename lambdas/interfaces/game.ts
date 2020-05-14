import { GameState } from "../game-state";
import { ICardContainer } from './card-container';

/**
 * Basic representation of the game.
 * 
 * IPillarsGame has all the UI functions in it. This interface represents
 * what we can share on the front and back end.
 */
export interface IGame {
    gameState: GameState;
    broadcast(message:string):Promise<any>;
    chat(message:string):Promise<any>;

    // We'll need websockets to send the below signals out while
    // AI is taking a turn and we want to animate or play a sound.

    /**
     * Animate talent addition.
     */
    animateTalent(mcard:ICardContainer, n:number):Promise<any>;

    /**
     * Animate creativity addition.
     */
    animateCreativity(mcard:ICardContainer, n:number):Promise<any>;

    /**
     * Animate credit addition.
     */
    animateCredits(mcard:ICardContainer, n:number):Promise<any>;

    /**
     * Animate customer addition.
     */
    animateCustomer(mcard:ICardContainer, n:number):Promise<any>;

    /**
     * Play a sound.
     */
    playSound(fileName:string):any;

    /**
     * End the turn.
     * 
     * Returns false if the game is over.
     */
    endTurn(): Promise<boolean>;
}

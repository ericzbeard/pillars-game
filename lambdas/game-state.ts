import {Player} from './player';
import {Card} from './card';

/**
 * Represents the current state of a game.
 */
export class GameState {

    /**
     * Id
     */
    id:string;

    /**
     * Name
     */
    name:string;

    /**
     * Public/Private
     */
    isPublic: boolean;

    /**
     * Waiting/In progress/Done
     */
    status: string;

    /**
     * Share URL
     */
    shareURL: string; // function?

    /**
     * Players (sign up or new each time?)
       
     */
    players: Array<Player>; 

    /**
     * Pillar max (4, 5, or 6)
     */
    pillarMax: number;

    /**
     * Date time started
     */
    startDateTime: string;

    /**
     * Market stack
     */
    marketStack: Array<Card>; 

    /**
     * Retired Cards
     */
    retiredCards: Array<Card>; 

    /**
     * Trial Stacks
     *   [Phase 1, Phase 2, Phase 3]
        •	Phase
        •	Face up/down
        •	Top card showing/hidden
     */
    trialStacks: Array<TrialStack>; 

    /**
     * Constructor.
     */
    constructor() {
        this.players = [];
        this.marketStack = [];
        this.retiredCards = [];
        this.trialStacks = [];
    }

}

/**
 * A stack of trial cards.
 */
export class TrialStack {
    phase: number;
    used: Array<Card>;
    notused: Array<Card>;
    topShowing: boolean;

    constructor() {
        this.used = [];
        this.notused = [];
    }
}

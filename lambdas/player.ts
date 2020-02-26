import {Card} from './card';

/**
 * A Pillars player.
 */
export class Player {
    /**
     * Id
     */
    id:string;

    /**
     * Name/Handle
     */
    name: string;

    /**
     * The player's deck.
     */
    deck: Array<Card>;

    /**
     * Hand
     */
    hand: Array<Card>;

    /**
     * Discard Pile
     */
    discardPile: Array<Card>;

    /**
     * In play
     */
    inPlay: Array<Card>;

    /**
     * Score (customers)
     */
    numCustomers: number;

    /**
     * Pillar ranks (I-V)
     */
    pillarRanks: number[];

    /**
     * Last dice roll
     */
    lastDiceRoll: number[];

    /**
     * Human or AI player.
     */
    isHuman: boolean;

    /**
     * Number of talents currently available to spend.
     */
    numTalents:number;

    /**
     * Number of creativity currently available to spend.
     */
    numCreativity: number;

    /**
     * Number of credits currently available to spend.
     */
    numCredits: number;

    /**
     * The player's array index. Play order.
     */
    index: number;

    constructor() {
        this.deck = [];
        this.hand = [];
        this.discardPile = [];
        this.inPlay = [];
        this.pillarRanks = [1, 2, 3, 4, 5];
        this.lastDiceRoll = [1, 1];
        this.numCustomers = 0;
        this.numTalents = 0;
        this.numCredits = 0;
        this.numCreativity = 0;
        this.isHuman = false;
        this.index = 0;
    }
}
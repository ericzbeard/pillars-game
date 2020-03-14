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
        this.pillarRanks = [1, 1, 1, 1, 1];
        this.lastDiceRoll = [];
        this.numCustomers = 0;
        this.numTalents = 0;
        this.numCredits = 0;
        this.numCreativity = 0;
        this.isHuman = false;
        this.index = 0;
    }

    /**
     * Get the total of the last dice roll.
     */
    getLastRollTotal() {
        if (!this.lastDiceRoll) return 0;
        let t = 0;
        for (let i = 0; i < this.lastDiceRoll.length; i++) {
            t += this.lastDiceRoll[i];
        }
        return t;
    }

    /**
     * Get the player's total pillar rank (experience or XP).
     */
    xp() {
        let t = 0;
        for (let i = 0; i < this.pillarRanks.length; i++) {
            t += this.pillarRanks[i];
        }
        return t;
    }

    /**
     * Get the current trial phase.
     * 
     * 1: Rank 5-11
     * 2: Rank 12-17
     * 3: Rank 18+
     */
    getCurrentTrialPhase() {
        const t = this.xp();
        if (t < 12) return 1;
        if (t < 18) return 2;
        return 3;
    }

}
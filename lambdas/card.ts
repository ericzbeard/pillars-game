/**
 * A Pillars Card.
 */
export class Card {

    name: string;
    type: string;
    subtype: string;
    bigtext: string;
    text: string;
    starter: boolean;
    copies: number;
    category?: string;
    flavor?: string;
    marketing?: string;
    success?: string;
    fail?: string;
    cost?: string;
    auction?: string;
    pillarIndex?: number;
    pillarNumeral?: string;

    /**
     * Each copy of a card used in the game is given a unique index.
     * 
     * E.g. each Junior Developer will have its own index.
     */
    uniqueIndex: number;

    constructor() { }

}
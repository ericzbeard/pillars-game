/**
 * A Pillars Card.
 */
export class Card {

    name:string;
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

    constructor() {}

}
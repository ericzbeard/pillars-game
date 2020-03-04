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
     * The currently active player.
     */
    currentPlayer: Player;

    /**
     * The current face up 7 market cards.
     */
    currentMarket: Array<Card>;

    /**
     * Constructor.
     */
    constructor() {
        this.players = [];
        this.marketStack = [];
        this.retiredCards = [];
        this.trialStacks = [];
        this.currentMarket = [];
    }

    
    /**
     * Randomly shuffle an array.
     * 
     * https://stackoverflow.com/a/2450976/1293256
     * 
     */
    static shuffle(array: Array<any>) {

        var currentIndex = array.length;
        var temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    /**
     * Draw a card for the player from their deck.
     */
    drawOne(player:Player) {

        if (player.deck.length == 0 && player.discardPile.length == 0) {
            console.log('No cards in deck or discard pile');

            // This might happen in a very lean deck with lots of draw

            return; // TODO - Alert?
        }

        // If the player is out of cards, shuffle the discard pile
        if (player.deck.length == 0) {
            player.deck = player.discardPile;
            player.discardPile = [];
            GameState.shuffle(player.deck);
        }

        player.hand.push(<Card>player.deck.pop());

    }

    /**
     * Put the max number of cards back in the market.
     */
    refillMarket() {

        let max = 7;
        if (this.marketStack.length < 7) {
            max = this.marketStack.length;
        }

        if (this.currentMarket.length < max) {
            const numEmpty = max - this.currentMarket.length;
            for (let i = 0; i < numEmpty; i++) {
                this.currentMarket.push(<Card>this.marketStack.pop());
            }
        }

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

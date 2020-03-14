import { Player } from './player';
import { Card } from './card';
import { cardDatabase } from './card-database';

/**
 * Represents the current state of a game.
 */
export class GameState {

    /**
     * Id
     */
    id: string;

    /**
     * Name
     */
    name: string;

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
     * Broadcast summaries.
     */
    broadcastSummaries: Array<string>;

    /**
     * The 5 pillars of the Well-Architected Framework.
     */
    pillars: Array<Card>;

    /**
     * Master copies of each unique card.
     */
    cardMasters: Map<string, Card>;

    /**
     * Constructor.
     */
    constructor() {
        this.players = [];
        this.marketStack = [];
        this.retiredCards = [];
        this.trialStacks = [];
        for (let i = 0; i < 3; i++) {
            this.trialStacks.push(new TrialStack());
        }
        this.currentMarket = [];
        this.broadcastSummaries = [];
        this.pillars = [];
        this.cardMasters = new Map<string, Card>();
    }

    /**
     * Get the last broadcast summary.
     */
    getLastBroadcastSummary() {
        if (!this.broadcastSummaries || this.broadcastSummaries.length == 0) {
            return '';
        }

        return this.broadcastSummaries[this.broadcastSummaries.length - 1];
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
    drawOne(player: Player):boolean {

        if (player.deck.length == 0 && player.discardPile.length == 0) {

            // This might happen in a very lean deck with lots of draw

            return false; // TODO - Alert?
        }

        // If the player is out of cards, shuffle the discard pile
        if (player.deck.length == 0) {
            player.deck = player.discardPile;
            player.discardPile = [];
            GameState.shuffle(player.deck);
        }

        player.hand.push(<Card>player.deck.pop());

        return true;
    }

    /**
     * Put all cards in play and hand into discard pile. Draw 6.
     */
    endTurn() {
        let p = this.currentPlayer;
        for (let i = 0; i < p.inPlay.length; i++) {
            p.discardPile.push(p.inPlay[i]);
        }
        p.inPlay = [];
        for (let i = 0; i < p.hand.length; i++) {
            p.discardPile.push(p.hand[i]);
        }
        p.hand= [];
        for (let i = 0; i < 6; i++) {
            this.drawOne(this.currentPlayer);
        }
        p.numCreativity = 0;
        p.numCredits = 0;
        p.numTalents = 0;

        // TODO - Move to the next player
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

    /**
     * Load the card database, shuffle, and draw opening hands.
     */
    initializeCards() {

        let uniqueIndex = 0;

        GameState.shuffle(cardDatabase.cards);

        // Load the card database
        for (let i = 0; i < cardDatabase.cards.length; i++) {
            const card = <Card>cardDatabase.cards[i];

            this.cardMasters.set(card.name, (Object.assign(new Card(), card)));

            switch (card.type) {
                case 'Resource':
                    if (card.starter) {
                        // Put copies in each player's deck
                        for (let i = 0; i < this.players.length; i++) {
                            const player = this.players[i];
                            for (let j = 0; j < card.copies / 4; j++) {
                                const copy = <Card>Object.assign(new Card(), card);
                                player.deck.push(copy);
                                copy.uniqueIndex = uniqueIndex++;
                            }
                        }
                    } else {
                        const copy = <Card>Object.assign(new Card(), card);
                        copy.uniqueIndex = uniqueIndex++;
                        this.marketStack.push(copy);
                    }
                    break;
                case 'Trial':
                    const trialCopy = <Card>Object.assign(new Card(), card);
                    trialCopy.uniqueIndex = uniqueIndex++;
                    switch (trialCopy.subtype) {
                        case 'Phase 1':
                            this.trialStacks[0].notused.push(trialCopy);
                            break;
                        case 'Phase 2':
                            this.trialStacks[1].notused.push(trialCopy);
                            break;
                        case 'Phase 3':
                            this.trialStacks[2].notused.push(trialCopy);
                            break;
                        default:
                            throw Error(`Unexpected Trial ${trialCopy.name}`);
                    }
                    break;
                case 'Pillar':
                    const pillarCopy = <Card>Object.assign(new Card(), card);
                    pillarCopy.uniqueIndex = uniqueIndex++;
                    this.pillars.push(pillarCopy);
                    break;
            }
        }

        this.pillars.sort((a, b) => <number>a.pillarIndex > <number>b.pillarIndex ? 1 : -1);

        // Fill the current market
        this.refillMarket();

        // Shuffle decks
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            GameState.shuffle(player.deck);
        }

        // Draw the opening hand
        for (const p of this.players) {
            for (let i = 0; i < 6; i++) {
                this.drawOne(p);
            }
        }

        // Shuffle market deck
        GameState.shuffle(this.marketStack);

        // Shuffle trial stacks
        for (const t of this.trialStacks) {
            GameState.shuffle(t.notused);
        }

    }

    /**
     * Check to see if the current player is allowed to play the card.
     */
    canPlayCard(card:Card) {
        if (card.subtype == "Augment Cloud") {
            let hasCloud = false;
            for (const inPlay of this.currentPlayer.inPlay) {
                if (inPlay.subtype == "Cloud") {
                    hasCloud = true;
                }
            }
            if (!hasCloud) {
                return false;
            }
        }

        if (card.subtype == "Augment Human") {
            let hasHuman = false;
            for (const inPlay of this.currentPlayer.inPlay) {
                if (inPlay.subtype == "Human") {
                    hasHuman = true;
                }
            }
            if (!hasHuman) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check to see if the stack needs to be shuffled and shuffle it if so.
     */
    checkTrialStack(stack:TrialStack) {
        if (stack.notused.length == 0) {
            for (const c of stack.used) {
                stack.notused.push(c);
            }
            stack.used = [];
            GameState.shuffle(stack.notused);
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

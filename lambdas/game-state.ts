import { Player, SerializedPlayer } from './player';
import { Card, SerializedCard } from './card';
import { cardDatabase } from './card-database';

/**
 * Represents the current state of a game.
 */
export class GameState {

    static readonly AI_NAMES = ['Skynet', 'HAL 9000', 'Agent Smith'];

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

    // /**
    //  * Chat messages and broadcast summaries.
    //  */
    // chat: Array<string>;

    /**
     * The 5 pillars of the Well-Architected Framework.
     */
    pillars: Array<Card>;

    /**
     * Master copies of each unique card.
     */
    cardMasters: Map<string, Card>;

    /**
     * Solo game.
     */
    isSolo: boolean;

    // *** If you add new fields here, don't forget SerializedGameState! ***

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
        // this.chat = [];
        this.pillars = [];
        this.cardMasters = new Map<string, Card>();
        this.isSolo = false;
    }

    // TODO - 1 player game? Play against the clock? Win in x turns?

    /**
     * Start a game.
     */
    start(numPlayers:number, pillarMax:number, name:string, isSolo:boolean) {

        this.pillarMax = pillarMax;

        // Create players (1 human and 3 AI)
        const human = new Player();
        human.isHuman = true;
        human.name = name;
        human.index = 0;

        this.players.push(human);
        this.currentPlayer = human;

        for (let i = 1; i < numPlayers; i++) {
            const player = new Player();
            player.isHuman = !isSolo;
            if (isSolo) {
                player.name = GameState.AI_NAMES[i - 1];
            }
            // Empty player name indicates an open invite
            player.index = i;
            this.players.push(player);
        }

        this.initializeCards();
    }

    // /**
    //  * Get the last broadcast summary.
    //  */
    // getLastBroadcastSummary() {
    //     if (!this.chat || this.chat.length == 0) {
    //         return '';
    //     }

    //     return this.chat[this.chat.length - 1];
    // }


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
     * 
     * Returns true if the deck was shuffled
     */
    drawOne(player: Player): boolean {

        let shuffled = false;

        if (player.deck.length == 0 && player.discardPile.length == 0) {

            // This might happen in a very lean deck with lots of draw

            return false; // TODO - Alert?
        }

        // If the player is out of cards, shuffle the discard pile
        if (player.deck.length == 0) {
            player.deck = player.discardPile;
            player.discardPile = [];
            GameState.shuffle(player.deck);
            shuffled = true;
        }

        player.hand.push(<Card>player.deck.shift());

        return shuffled;
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
                this.currentMarket.push(<Card>this.marketStack.shift());
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

        // Shuffle market deck
        GameState.shuffle(this.marketStack);

        // // TESTING
        // // TODO - Remove this

        // // Add specific cards to the top of the market stack so we can test quickly.
        // this.marketStack.unshift(Object.assign(new Card(), 
        //     this.cardMasters.get('Competitive Research')));


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

        // Shuffle trial stacks
        for (const t of this.trialStacks) {
            GameState.shuffle(t.notused);
        }
        
        // // TESTING
        // // TODO - Remove this
        // const ak = Object.assign(new Card(), this.cardMasters.get('Employees Poached'));
        // ak.uniqueIndex = 1000;
        // this.trialStacks[0].notused.unshift(ak);

    }

    /**
     * Check to see if the current player is allowed to play the card.
     */
    canPlayCard(card: Card, player:Player) {

        if (this.currentPlayer.index != player.index) {
            return false;
        }

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
     * Returns true if the card is in the current player's hand.
     */
    isInHand(card: Card): boolean {
        for (const c of this.currentPlayer.hand) {
            if (c.uniqueIndex == card.uniqueIndex) return true;
        }
        return false;
    }

    /**
     * Returns true if the card in the the current market (showing).
     */
    isInMarket(card: Card): boolean {
        for (const c of this.currentMarket) {
            if (c.uniqueIndex == card.uniqueIndex) return true;
        }
        return false;
    }

    /**
     * Check to see if the stack needs to be shuffled and shuffle it if so.
     */
    checkTrialStack(stack: TrialStack) {
        if (stack.notused.length == 0) {
            for (const c of stack.used) {
                stack.notused.push(c);
            }
            stack.used = [];
            GameState.shuffle(stack.notused);
        }
    }

    /**
     * Remove the card from hand.
     */
    removeCardFromHand(player:Player, card:Card) {

        console.log(`About to remove ${card.name} from hand. ${card.uniqueIndex}`);

        // Remove it from hand
        let indexToRemove = -1;
        for (let i = 0; i < player.hand.length; i++) {
            if (player.hand[i].uniqueIndex == card.uniqueIndex) {
                indexToRemove = i;
            }
        }
        if (indexToRemove > -1) {
            player.hand.splice(indexToRemove, 1);
        } else {
            throw Error('Unable to remove card from hand');
        }
    }

    /**
     * Remove the card from in play.
     */
    removeCardFromInPlay(player:Player, card:Card) {

        console.log(`About to remove ${card.name} from in play. ${card.uniqueIndex}`);

        // Remove it from hand
        let indexToRemove = -1;
        for (let i = 0; i < player.inPlay.length; i++) {
            if (player.inPlay[i].uniqueIndex == card.uniqueIndex) {
                indexToRemove = i;
            }
        }
        if (indexToRemove > -1) {
            player.inPlay.splice(indexToRemove, 1);
        } else {
            throw Error('Unable to remove card from in play');
        }
    }

    /**
     * Promote or demote the current player.
     */
    promote(pillarIndex: number, isDemote: boolean) {
        const r = this.currentPlayer.pillarRanks[pillarIndex];

        if (isDemote) {
            if (r > 1) {
                this.currentPlayer.pillarRanks[pillarIndex]--;
            }
        } else {
            if (r < this.pillarMax) {
                this.currentPlayer.pillarRanks[pillarIndex]++;
            }
        }
    }

    /**
     * End a trial (and end the turn).
     */
    endTrial(stack:TrialStack, winner:boolean, drawNum?:number):boolean {
       
        let shuffled = false;

        // Default hand size is 6 unless it's been overridden
        if (drawNum === undefined) {
            drawNum = 6;
        }

        // Move the trial we just faced to the used pile
        stack.used.push(<Card>stack.notused.shift());

        let p = this.currentPlayer;
        for (let i = 0; i < p.inPlay.length; i++) {
            p.discardPile.push(p.inPlay[i]);
        }
        p.inPlay = [];
        for (let i = 0; i < p.hand.length; i++) {
            p.discardPile.push(p.hand[i]);
        }
        p.hand = [];
        for (let i = 0; i < drawNum; i++) {
            shuffled = this.drawOne(p);
        }
        p.numCreativity = 0;
        p.numCredits = 0;
        p.numTalents = 0;

        return shuffled;
    }

    /**
     * Create a real player object.
     */
    public static RehydratePlayer(s: SerializedPlayer, 
        cards:Map<string, Card>): Player {

        const player = new Player();

        player.id = s.id;
        player.name = s.name;
        player.deck = new Array<Card>();
        for (const c of s.deck) {
            const card = <Card>Object.assign(new Card(), cards.get(c.name));
            card.uniqueIndex = c.uniqueIndex;
            player.deck.push(card);
        }
        player.hand = new Array<Card>();
        for (const c of s.hand) {
            const card = <Card>Object.assign(new Card(), cards.get(c.name));
            card.uniqueIndex = c.uniqueIndex;
            player.hand.push(card);
        }
        player.discardPile = new Array<Card>();
        for (const c of s.discardPile) {
            const card = <Card>Object.assign(new Card(), cards.get(c.name));
            card.uniqueIndex = c.uniqueIndex;
            player.discardPile.push(card);
        }
        player.inPlay = new Array<Card>();
        for (const c of s.inPlay) {
            const card = <Card>Object.assign(new Card(), cards.get(c.name));
            card.uniqueIndex = c.uniqueIndex;
            player.inPlay.push(card);
        }
        player.numCustomers = s.numCustomers;
        player.pillarRanks = s.pillarRanks.slice();
        player.lastDiceRoll = s.lastDiceRoll.slice();
        player.isHuman = s.isHuman;
        player.numTalents = s.numTalents;
        player.numCreativity = s.numCreativity;
        player.numCredits = s.numCredits;
        player.index = s.index;

        return player;
    }

    /**
     * Create a real trial stack object.
     */
    public static RehydrateTrialStack(s: SerializedTrialStack, 
        cards:Map<string, Card>): TrialStack {

        const trialStack = new TrialStack();

        trialStack.phase = s.phase;
        trialStack.used = new Array<Card>();
        for (const c of s.used) {
            const card = <Card>Object.assign(new Card(), cards.get(c.name));
            card.uniqueIndex = c.uniqueIndex;
            trialStack.used.push(card);
        }
        trialStack.notused = new Array<Card>();
        for (const c of s.notused) {
            const card = <Card>Object.assign(new Card(), cards.get(c.name));
            card.uniqueIndex = c.uniqueIndex;
            trialStack.notused.push(card);
        }

        return trialStack;
    }

    /**
     * Put the real game state back together.
     */
    public static RehydrateGameState(s: SerializedGameState): GameState {
        const gameState = new GameState();

        // Load the card database
        for (let i = 0; i < cardDatabase.cards.length; i++) {
            const card = <Card>cardDatabase.cards[i];
            gameState.cardMasters.set(card.name, (Object.assign(new Card(), card)));
        }

        const cards = gameState.cardMasters;

        gameState.id = s.id;
        gameState.name = s.name;
        gameState.isPublic = s.isPublic;
        gameState.status = s.status;
        gameState.shareURL = s.shareURL;
        gameState.players = new Array<Player>();
        for (const p of s.players) {
            const player = GameState.RehydratePlayer(p, gameState.cardMasters);
            gameState.players.push(player);
            if (p.index == s.currentPlayer) {
                gameState.currentPlayer = player;
            }
        }
        if (!gameState.currentPlayer) {
            gameState.currentPlayer = gameState.players[0];
        }
        gameState.pillarMax = s.pillarMax;
        gameState.startDateTime = s.startDateTime;
        gameState.marketStack = new Array<Card>();
        for (const c of s.marketStack) {
            const card = <Card>Object.assign(new Card(), cards.get(c.name));
            card.uniqueIndex = c.uniqueIndex;
            gameState.marketStack.push(card);
        }
        gameState.retiredCards = new Array<Card>();
        for (const c of s.retiredCards) {
            const card = <Card>Object.assign(new Card(), cards.get(c.name));
            card.uniqueIndex = c.uniqueIndex;
            gameState.retiredCards.push(card);
        }
        gameState.trialStacks = new Array<TrialStack>();
        for (const t of s.trialStacks) {
            const trialStack = GameState.RehydrateTrialStack(t, cards);
            gameState.trialStacks.push(trialStack);
        }
        gameState.currentMarket = new Array<Card>();
        for (const c of s.currentMarket) {
            const card = <Card>Object.assign(new Card(), cards.get(c.name));
            card.uniqueIndex = c.uniqueIndex;
            gameState.currentMarket.push(card);
        }
        // gameState.chat = s.chat.slice();
        gameState.pillars = new Array<Card>();
        for (const c of s.pillars) {
            const card = <Card>Object.assign(new Card(), cards.get(c.name));
            card.uniqueIndex = c.uniqueIndex;
            gameState.pillars.push(card);
        }
        gameState.isSolo = s.isSolo;

        return gameState;
    }
}

/**
 * A stack of trial cards.
 */
export class TrialStack {
    phase: number;
    used: Array<Card>;
    notused: Array<Card>;

    constructor() {
        this.used = [];
        this.notused = [];
    }
}

/**
 * A simplified version of the trial stack used for serialization.
 */
export class SerializedTrialStack {
    phase: number;
    used: Array<SerializedCard>;
    notused: Array<SerializedCard>;

    constructor(trialStack: TrialStack) {
        this.phase = trialStack.phase;
        this.used = new Array<SerializedCard>();
        for (const c of trialStack.used) {
            this.used.push(new SerializedCard(c));
        }
        this.notused = new Array<SerializedCard>();
        for (const c of trialStack.notused) {
            this.notused.push(new SerializedCard(c));
        }
    }

}

/**
 * A simplified version of the game state that can be re-hydrated client-side.
 */
export class SerializedGameState {

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
    players: Array<SerializedPlayer>;

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
    marketStack: Array<SerializedCard>;

    /**
     * Retired Cards
     */
    retiredCards: Array<SerializedCard>;

    /**
     * Trial Stacks
     *   [Phase 1, Phase 2, Phase 3]
     */
    trialStacks: Array<SerializedTrialStack>;

    /**
     * The currently active player.
     */
    currentPlayer: number;

    /**
     * The current face up 7 market cards.
     */
    currentMarket: Array<SerializedCard>;

    // /**
    //  * Chat and broadcast summaries.
    //  */
    // chat: Array<string>;

    /**
     * The 5 pillars of the Well-Architected Framework.
     */
    pillars: Array<SerializedCard>;

    /**
     * Solo game.
     */
    isSolo: boolean;

    /**
     * Constructor.
     */
    constructor(gameState: GameState) {
        this.id = gameState.id;
        this.name = gameState.name;
        this.isPublic = gameState.isPublic;
        this.status = gameState.status;
        this.shareURL = gameState.shareURL;
        this.players = new Array<SerializedPlayer>();
        for (const p of gameState.players) {
            this.players.push(new SerializedPlayer(p));
        }
        this.pillarMax = gameState.pillarMax;
        this.startDateTime = gameState.startDateTime;
        this.marketStack = new Array<SerializedCard>();
        for (const c of gameState.marketStack) {
            this.marketStack.push(new SerializedCard(c));
        }
        this.retiredCards = new Array<SerializedCard>();
        for (const c of gameState.retiredCards) {
            this.retiredCards.push(new SerializedCard(c));
        }
        this.trialStacks = new Array<SerializedTrialStack>();
        for (const t of gameState.trialStacks) {
            this.trialStacks.push(new SerializedTrialStack(t));
        }
        if (gameState.currentPlayer) {
            this.currentPlayer = gameState.currentPlayer.index;
        }
        this.currentMarket = new Array<SerializedCard>();
        for (const c of gameState.currentMarket) {
            this.currentMarket.push(new SerializedCard(c));
        }
        // this.chat = gameState.chat.slice();
        this.pillars = new Array<SerializedCard>();
        for (const c of gameState.pillars) {
            this.pillars.push(new SerializedCard(c));
        }
        this.isSolo = gameState.isSolo;
    }

}

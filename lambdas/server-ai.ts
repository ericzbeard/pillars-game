import { Database } from './database';
import { GameState, SerializedGameState } from './game-state';
import { ServerGame, CustomServerActions, StandardServerActions } from './server-game';
import { CardActions } from './card-actions';
import { Card } from './card';
import { PillarsSounds } from './sounds';

/**
 * Sleep for ms.
 * 
 * e.g. await sleep(500);
 */
const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Random from 0 to n (non-inclusive)
 * 
 * e.g. rando(6) will give 0,1,2,3,4,5
 */
const rando = (n: number) => {
    return Math.floor(Math.random() * n);
}

/**
 * Get a random greeting, this is the first thing the AI says.
 */
const greeting = () => {
    const greetings = [
        "I love it when it's my turn!",
        "My turn! Time to crush the humans.",
        "Finally! I thought you would never finish your turn."
    ];

    return greetings[rando(greetings.length)];
}

/**
 * Server-side AI.
 * 
 * TODO - Merge with local
 */
export class ServerAi {

    private game: ServerGame;
    private actions: CardActions;

    constructor(private gameState: GameState, private database: Database) {
        this.game = new ServerGame(gameState, database);

        const custom = new CustomServerActions();
        const standard = new StandardServerActions();

        this.actions = new CardActions(this.game, custom, standard);
    }

    /**
     * Take a single turn for the current AI player.
     */
    async takeTurn() {
        // See whose turn it is, make sure it's AI
        const player = this.gameState.currentPlayer;
        if (player.isHuman) {
            throw Error('Current player is human!');
        }

        const chat = async (msg: string) => {
            await this.database.chatAdd(this.gameState.id, `[${player.name}] ${msg}`);
        }

        await chat(`${greeting()}`);

        await sleep(2000);

        // Play cards, buy cards, face a trial
        for (const card of player.hand) {
            if (this.gameState.canPlayCard(card, player)) {
                this.actions.play({ card: card }, () => { });

                await sleep(2000);

                // TODO - Reevaluate augments
            }
        }

        const afterAcquireCard = (card:Card, free:boolean) => {

            this.gameState.removeCardFromMarket(card);

            if (!free) {
                // Subtract the cost from the player's current resources
                const cost = card.convertCost();
                player.numCredits -= cost.credits;
                player.numTalents -= cost.talents;
            }

        }

        // Buy cards
        for (const card of this.gameState.currentMarket) {
            if (card.canAcquire(player.numCredits, player.numTalents)) {

                let free = false;

                if (card.subtype == 'Bug') {

                    const chosenPlayer = this.gameState.players[0]; // TODO

                    // Add it to their discard pile
                    chosenPlayer.discardPile.push(card);

                    // Announce what happened
                    await this.game.broadcast(`${player.name} put ${card.name} ` + 
                        `into ${chosenPlayer.name}'s discard pile!`);

                    afterAcquireCard(card, free);

                    this.game.playSound(PillarsSounds.FAIL);

                } else {
                    player.discardPile.push(card);
                    afterAcquireCard(card, free);
                    this.game.playSound(PillarsSounds.CLICK);
                    await this.game.broadcast(
                        `${this.gameState.currentPlayer.name} acquired ${card.name}`);
                }

                await sleep(2000);
            }
        }

        // Face a trial
        // TODO

        // End the turn
        await this.game.broadcast(`${player.name} ended their turn.`);

        let nextIndex = player.index + 1;
        if (nextIndex >= this.gameState.players.length) {
            nextIndex = 0;
        }

        const nextPlayer = this.gameState.players[nextIndex];
        this.gameState.currentPlayer = nextPlayer;
        await this.game.broadcast(`It's ${nextPlayer.name}'s turn now.`);
    }
}
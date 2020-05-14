import { Database } from './database';
import { GameState, SerializedGameState } from './game-state';
import { CardActions } from './card-actions';
import { Card } from './card';
import { PillarsSounds } from './sounds';
import { IGame } from './interfaces/game';
import { CustomServerActions } from './custom-server-actions';
import { StandardServerActions } from './standard-server-actions';

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
 */
export class ServerAi {

    private actions: CardActions;
    private gameState: GameState;

    constructor(private game:IGame) {
        this.gameState = game.gameState;
        const custom = new CustomServerActions();
        const standard = new StandardServerActions();
        this.actions = new CardActions(this.game, custom, standard);
    }

    /**
     * Take a single turn for the current AI player.
     * 
     * Returns false if the game is over.
     */
    async takeTurn() {
        // See whose turn it is, make sure it's AI
        const player = this.gameState.currentPlayer;
        if (player.isHuman) {
            throw Error('Current player is human!');
        }

        await this.game.chat(`[${player.name}] ${greeting()}`);

        await sleep(2000);

        // Play cards, buy cards, face a trial
        for (const card of player.hand) {
            if (this.gameState.canPlayCard(card, player)) {

                await this.actions.play({ card }, async () => { 
                    await this.game.broadcast(`${player.name} played ${card.name}`);
                });

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

                const free = false;

                if (card.subtype === 'Bug') {

                    const chosenPlayer = this.gameState.players[0]; // TODO

                    // Add it to their discard pile
                    chosenPlayer.discardPile.push(card);

                    // Announce what happened
                    await this.game.broadcast(`${player.name} put ${card.name} ` + 
                        `into ${chosenPlayer.name}'s discard pile!`);

                    await this.game.chat(`[${player.name}] Ha ha! Hope you enjoy that bug`);
                    
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
        const phase = player.getCurrentTrialPhase();
        const stack = this.game.gameState.trialStacks[phase - 1];
        this.game.gameState.checkTrialStack(stack);
        const trialCard = stack.notused[0];
        await this.game.broadcast(`${player.name} is facing a trial: ${trialCard.name}`);
        await sleep(2000);
        const add = trialCard.add ? player.pillarRanks[trialCard.pillarIndex || 0] : 0;
        const numCreativity = player.numCreativity + add;
        const roll0 = Math.floor(Math.random() * 6) + 1;
        const roll1 = Math.floor(Math.random() * 6) + 1;
        const roll = roll0 + roll1;
        const total = roll + numCreativity;
        await this.game.playSound(PillarsSounds.DICE);

        const winner = total >= trialCard.trial;
        const wonlost = winner ? 'won' : 'lost';
        await this.game.broadcast(`${player.name} rolled ${roll} (+${numCreativity} ` + 
            `Creativity) and ${wonlost} the trial!`);

        if (winner) {
            this.game.playSound(PillarsSounds.SUCCESS);
            await this.game.chat(`[${player.name}] Yessssss. Evil wins again.`);
        } else {
            this.game.playSound(PillarsSounds.FAIL);
            await this.game.chat(`[${player.name}] Not fair!. These dice are rigged.`);
        }

        const p = new Promise((resolve, reject) => {
                
            console.log(`server-ai ending trial`);

            // tslint:disable-next-line: no-floating-promises
            this.actions.endTrial(winner, { card: trialCard }, async (drawNum?:number) => {
                const shuffled = this.game.gameState.endTrial(stack, winner, drawNum);
                if (shuffled) {
                    await this.game.playSound(PillarsSounds.SHUFFLE);
                }
                const keepPlaying = await this.game.endTurn();

                console.log(`resolve ${keepPlaying}`);

                resolve(keepPlaying);
            });

        });

        // End the turn
        return await p;
    }
}
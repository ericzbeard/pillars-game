import { GameState, SerializedGameState } from './game-state';
import { PillarsSounds } from './sounds';
import { ICardContainer, IGame, ICustomActions } from './card-actions';
import { IStandardActions, CustomEffect } from './card-actions';
import { Database } from './database';
import { Player } from './player';


/**
 * This is the server-side equivalent of PillarsGame.
 */
export class ServerGame implements IGame {
    
    constructor(public gameState: GameState, 
        private database: Database) {}

    /**
     * Broadcast a game state change to all clients.
     */
    async broadcast(message:string): Promise<any> {

        // Increment the version
        this.gameState.version++;

        // Save the changes
        await this.database.gameUpdate(new SerializedGameState(this.gameState));

        // Send a chat message
        await this.database.chatAdd(this.gameState.id, message);

        // TODO - websockets
    }

    async chat(msg: string) {
        const player = this.gameState.currentPlayer;
        await this.database.chatAdd(this.gameState.id, `[${player.name}] ${msg}`);
    }

    // We'll need websockets to send the below signals out while
    // AI is taking a turn and we want to animate or play a sound.

    /**
     * Send a signal to all clients to animate talent addition.
     */
    async animateTalent(mcard:ICardContainer, n:number) {

    }

    /**
     * Send a signal to all clients to animate creativity addition.
     */
    async animateCreativity(mcard:ICardContainer, n:number) {

    }

    /**
     * Send a signal to all clients to animate credit addition.
     */
    async animateCredits(mcard:ICardContainer, n:number) {

    }

    /**
     * Send a signal to all clients to animate customer addition.
     */
    async animateCustomer(mcard:ICardContainer, n:number) {

    }

    /**
     * Send a signal to all clients to play a sound.
     */
    async playSound(fileName:string) {

    }

    /**
     * End the turn.
     */
    async endTurn() {
        const player = this.gameState.currentPlayer;

        await this.broadcast(`${player.name} ended their turn.`);

        let nextIndex = player.index + 1;
        if (nextIndex >= this.gameState.players.length) {
            nextIndex = 0;
        }

        const nextPlayer = this.gameState.players[nextIndex];
        this.gameState.currentPlayer = nextPlayer;
        await this.broadcast(`It's ${nextPlayer.name}'s turn now.`);
    }
}

/**
 * Card action server side, used by AI.
 */
export class StandardServerActions implements IStandardActions {

    /**
     * Remove a card in hand from the game.
     */
    async retireCardFromHand(game: IGame, mcard: ICardContainer, callback?: Function) {

        const player = game.gameState.currentPlayer;

        for (const card of player.hand) {
            if (card.uniqueIndex != mcard.card.uniqueIndex) {
                game.gameState.removeCardFromHand(player, card);
                await game.broadcast(`${player.name} retired ${card.name} from hand`);
                break;
            }

            // TODO - Be smarter, dont retire good cards.
        }

        callback?.();
    }

    /**
     * Broadcast promotion to all clients.
     */
    async broadcastPromotion(game:IGame, 
        player:Player, pillarIndex:number, 
        isDemote:boolean, didSomething: boolean) {
        const NUMERALS = ['I', 'II', 'III', 'IV', 'V'];
        const numeral = NUMERALS[pillarIndex];
        let pd = isDemote ? 'demoted' : 'promoted';

        if (didSomething) {
            await game.broadcast(`${player.name} ${pd} pillar ${numeral}`);
            game.playSound(PillarsSounds.PROMOTE);
        } else {
            pd = isDemote ? 'demote' : 'promote';
            await game.broadcast(`${player.name} could not ${pd} pillar ${numeral}`);
        }
    }

    /**
     * Promote (or demote)
     * 
     * Roll a d6 and promote that pillar, unless it's maxed.
     * 
     * On a 6, choose a non-maxed pillar to promote.
     */
    async promote(game: IGame, callback?: Function, isDemote?: boolean) {

        if (isDemote === undefined) {
            isDemote = false;
        }
        const player = game.gameState.currentPlayer;

        const roll = Math.floor(Math.random() * 6) + 1;
        game.playSound(PillarsSounds.DICE);

        if (roll == 6) {
            this.promoteAny(game, callback, isDemote);
        } else {
            const didSomething = game.gameState.promote(roll - 1, <boolean>isDemote);
            await this.broadcastPromotion(game, player, roll -1, isDemote, didSomething);
            callback?.();
        }

    }

     /**
     * Promote (or demote) any pillar.
     * 
     * Choose a non-maxed pillar to promote.
     */
    async promoteAny(game: IGame, callback?: Function, isDemote?: boolean) {

        if (isDemote === undefined) {
            isDemote = false;
        }

        const player = game.gameState.currentPlayer;

        let pillarToPromote = -1;
        for (let i = 0; i < 5; i++) {
            if (isDemote) {
                // Choose one that's already 1 if possible
                if (player.pillarRanks[i] == 1) {
                    pillarToPromote = i;
                    break;
                }
            } else {
                // Choose one that's not maxed
                if (player.pillarRanks[i] < game.gameState.pillarMax) {
                    pillarToPromote = i;
                    break;
                }
            }
        }
        if (pillarToPromote > -1) {
            const didSomething = game.gameState.promote(pillarToPromote, isDemote);
            await this.broadcastPromotion(game, player, pillarToPromote, isDemote, didSomething);
        }

    }
}

/**
 * Custom server card actions, used by AI.
 */
export class CustomServerActions implements ICustomActions {
    customEffects: Map<string, CustomEffect>;

    constructor() {
        this.customEffects = new Map<string, CustomEffect>();
    }

    /**
     * Get the custom effect by name.
     */
    get(key:string): CustomEffect {
        return <CustomEffect>this.customEffects.get(key);
    }

}
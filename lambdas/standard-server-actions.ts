import { IGame } from "./interfaces/game";
import { PillarsSounds } from "./sounds";
import { Player } from "./player";
import { ICardContainer } from "./interfaces/card-container";
import { IStandardActions } from "./interfaces/standard-actions";

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
            if (card.uniqueIndex !== mcard.card.uniqueIndex) {
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
    async broadcastPromotion(game: IGame,
        player: Player, pillarIndex: number,
        isDemote: boolean, didSomething: boolean) {
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
    async promote(game: IGame, callback?: () => any, isDemote?: boolean) {

        if (isDemote === undefined) {
            isDemote = false;
        }
        const player = game.gameState.currentPlayer;

        const roll = Math.floor(Math.random() * 6) + 1;
        game.playSound(PillarsSounds.DICE);

        if (roll === 6) {
            await this.promoteAny(game, callback, isDemote);
        } else {
            const didSomething = game.gameState.promote(roll - 1, isDemote);
            await this.broadcastPromotion(game, player, roll - 1, isDemote, didSomething);
            callback?.();
        }

    }

    /**
     * Promote (or demote) any pillar.
     * 
     * Choose a non-maxed pillar to promote.
     */
    async promoteAny(game: IGame, callback?: () => any, isDemote?: boolean) {

        if (isDemote === undefined) {
            isDemote = false;
        }

        const player = game.gameState.currentPlayer;

        let pillarToPromote = -1;
        for (let i = 0; i < 5; i++) {
            if (isDemote) {
                // Choose one that's already 1 if possible
                if (player.pillarRanks[i] === 1) {
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

        callback?.();
    }
}

import { IPillarsGame } from '../interfaces/pillars-game';
import { IGame } from '../../lambdas/interfaces/game';
import { ICardContainer } from '../../lambdas/interfaces/card-container';
import { MouseableCard } from '../ui-utils/mouseable-card';
import { PillarsSounds } from '../../lambdas/sounds';

/**
 * Data Center Migration
 * 
 * Success: Promote your lowest pillars
 */
export const dataCenterMigration = (g:IGame, 
    m: ICardContainer, 
    callback:() => any, 
    winner?: boolean) => {

    const game = g as IPillarsGame;
    const mcard = m as MouseableCard;
    
    if (!winner) {
        callback?.();
        return;
    }

    const modal = game.showModal('All of you lowest ranked pillars are promoted!');
    modal.hideCloseButton();

    setTimeout(() => {

        const player = game.gameState.currentPlayer;
        const ranks = player.pillarRanks;
        let lowest = 6;
        for (const rank of ranks) {
            if (rank < lowest) lowest = rank;
        }

        for (let i = 0; i < ranks.length; i++) {
            const rank = ranks[i];
            if (rank === lowest && rank < game.gameState.pillarMax) {
                game.promote(player.index, i);
            }
        }

        game.playSound(PillarsSounds.PROMOTE);

        callback?.();
    }, 2000);

}
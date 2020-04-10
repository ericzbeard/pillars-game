import { IPillarsGame, MouseableCard } from '../ui-utils';
import { PillarsSounds } from '../../lambdas/sounds';
import { IGame, ICardContainer } from '../../lambdas/card-actions';

/**
 * Data Center Migration
 * 
 * Success: Promote your lowest pillars
 */
export const dataCenterMigration = (g:IGame, 
    m: ICardContainer, 
    callback:Function, 
    winner?: boolean) => {

    const game = <IPillarsGame>g;
    const mcard = <MouseableCard>m;
    
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
        for (let i = 0; i < ranks.length; i++) {
            const rank = ranks[i];
            if (rank < lowest) lowest = rank;
        }

        for (let i = 0; i < ranks.length; i++) {
            const rank = ranks[i];
            if (rank == lowest && rank < game.gameState.pillarMax) {
                game.promote(player.index, i);
            }
        }

        game.playSound(PillarsSounds.PROMOTE);

        callback?.();
    }, 2000);

}
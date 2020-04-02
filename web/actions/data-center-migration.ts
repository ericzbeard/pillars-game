import { IPillarsGame, PillarsSounds, MouseableCard } from '../ui-utils';
import { PillarsConstants } from '../constants';

/**
 * Data Center Migration
 * 
 * Success: Promote your lowest pillars
 */
export const dataCenterMigration = (game: IPillarsGame, 
    mcard: MouseableCard, 
    callback: Function, 
    winner?: boolean) => {

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
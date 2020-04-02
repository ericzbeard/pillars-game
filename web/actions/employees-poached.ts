import { IPillarsGame, PillarsSounds, MouseableCard } from '../ui-utils';
import { PillarsConstants } from '../constants';
import { promote } from './promote';

/**
 * Employees Poached
 * 
 * Success: Acquire a resource card from the market for free
 * Fail: Demote twice
 */
export const employeesPoached = (game: IPillarsGame, 
    mcard: MouseableCard, 
    callback: Function, 
    winner?: boolean) => {

    if (winner) {
        const modal = game.showModal('Acquire a resource card from the market for free');
        modal.hideCloseButton();

        // Show market cards
        
        const p = game.localPlayer;
        const y = PillarsConstants.MODALY + 350;
        const scale = 0.75;
        const cw = PillarsConstants.CARD_WIDTH * scale;
        const offset = 5;
        const totalw = cw * 7 + offset * 6;
        
        let curx = PillarsConstants.MODALX + (PillarsConstants.MODALW - totalw) / 2;

        for (let i = 0; i < game.gameState.currentMarket.length; i++) {
            const card = game.gameState.currentMarket[i];
            if (card) {
                
                const m = new MouseableCard(card);
                m.x = curx;
                m.y = y;
                m.w = cw;
                m.h = PillarsConstants.CARD_HEIGHT * scale;
                m.zindex = PillarsConstants.MODALZ + 1;
                m.onclick = () => {
                    game.closeModal();
                    game.acquireCard(card, m.key, true, callback);
                };
                m.render = () => {
                    game.renderCard(m, false, scale);
                }
                game.addMouseable(PillarsConstants.MODAL_KEY + '_market_' + i, m);

            }
            curx += cw + offset;
        }

    } else {

        // Demote twice
        promote(game, () => {
            promote(game, callback, true);
        }, true);
    }
}
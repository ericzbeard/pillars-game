import { IPillarsGame, MouseableCard } from '../ui-utils';
import { PillarsConstants } from '../constants';
import { StandardActions } from '../standard-actions';
import { IGame, ICardContainer } from '../../lambdas/card-actions';

/**
 * Employees Poached
 * 
 * Success: Acquire a resource card from the market for free
 * Fail: Demote twice
 */
export const employeesPoached = (g:IGame, 
    m: ICardContainer, 
    callback:Function, 
    winner?: boolean) => {

    const game = <IPillarsGame>g;
    const mcard = <MouseableCard>m;
    
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

        const sa = new StandardActions();

        // Demote twice
        sa.promote(game, () => {
            sa.promote(game, callback, true);
        }, true);
    }
}
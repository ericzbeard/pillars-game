import { PillarsConstants } from '../constants';
import { StandardActions } from '../standard-actions';
import { IGame } from '../../lambdas/interfaces/game';
import { ICardContainer } from '../../lambdas/interfaces/card-container';
import { IPillarsGame } from '../interfaces/pillars-game';
import { MouseableCard } from '../ui-utils/mouseable-card';

/**
 * Employees Poached
 * 
 * Success: Acquire a resource card from the market for free
 * Fail: Demote twice
 */
export const employeesPoached =(g:IGame, 
    m: ICardContainer, 
    callback:() => any, 
    winner?: boolean) => {

    const game = g as IPillarsGame;
    const mcard = m as MouseableCard;
    
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
                
                const c = new MouseableCard(card);
                c.x = curx;
                c.y = y;
                c.w = cw;
                c.h = PillarsConstants.CARD_HEIGHT * scale;
                c.zindex = PillarsConstants.MODALZ + 1;
                c.onclick = () => {
                    game.closeModal();
                    game.acquireCard(card, c.key, true, callback);
                };
                c.render = () => {
                    game.renderCard(c, false, scale);
                }
                game.addMouseable(PillarsConstants.MODAL_KEY + '_market_' + i, c);

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
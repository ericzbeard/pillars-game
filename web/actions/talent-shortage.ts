import { IPillarsGame, Mouseable, MouseableCard, Button } from '../ui-utils';
import { PillarsConstants } from '../constants';
import { IGame, ICardContainer } from '../../lambdas/card-actions';

/**
 * Talent Shortage
 * 
 * Fail: Draw 1 less card at the end of this turn.
 */
export const talentShortage = (g:IGame, 
    m: ICardContainer, 
    callback:Function, 
    winner?: boolean) => {

    const game = <IPillarsGame>g;
    const mcard = <MouseableCard>m;
    
    if (winner) {
        if (callback) callback();
        return;
    }

    const modal = game.showModal('You draw one less card at the end of this turn');
    modal.hideCloseButton();

    setTimeout(() => {
        if (callback) callback(5);
    }, 2000);

}
import { IPillarsGame, Mouseable, MouseableCard, Button } from '../ui-utils';
import { PillarsConstants } from '../constants';

/**
 * Talent Shortage
 * 
 * Fail: Draw 1 less card at the end of this turn.
 */
export const talentShortage = (game: IPillarsGame, 
    mcard: MouseableCard, 
    callback: Function, 
    winner?: boolean) => {

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
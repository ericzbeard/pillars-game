import { MouseableCard, IPillarsGame, Button, DieRollAnimation, Mouseable } from './ui-utils';
import { PillarsSounds } from '../lambdas/sounds';
import { PillarsConstants } from './constants';
import { CardActions } from '../lambdas/card-actions';  
import { ThrottledBandwidth } from './actions/throttled-bandwidth';
import { CustomActions } from './custom-actions';
import { StandardActions } from './standard-actions';

export const gameOver = (game:IPillarsGame) => {
    game.closeModal();
    const modal = game.showModal('Game Over!');
    modal.hideCloseButton();

    // Calculate score, including bonus customers.

    // Show all scores

    
}
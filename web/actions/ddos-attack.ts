import { Mouseable } from '../ui-utils/mouseable';
import { IGame } from '../../lambdas/interfaces/game';
import { ICardContainer } from '../../lambdas/interfaces/card-container';
import { IPillarsGame } from '../interfaces/pillars-game';
import { MouseableCard } from '../ui-utils/mouseable-card';
import { Button } from '../ui-utils/button';
import { PillarsConstants } from '../constants';


/**
 * DDoS Attack.
 * 
 * You may retire a card you played this turn.
 */
export const ddosAttack = (g:IGame, 
    m: ICardContainer, 
    callback:() => any, 
    winner?: boolean) => {

    const game = g as IPillarsGame;
    const mcard = m as MouseableCard;
    
    if (!winner) {
        if (callback) callback();
        return;
    }

    // Open a modal and show all cards played this turn.
    // This will be tricky since we are already in a modal and can't magnify...

    const modal = game.showModal("Choose a card you played this turn to retire");
    modal.hideCloseButton();

    // Show option to retire nothing.
    const button = new Button('No Thanks', game.ctx);
    const half = PillarsConstants.MODALX + PillarsConstants.MODALW / 2;
    button.x = half - PillarsConstants.MENU_BUTTON_W;
    button.y = PillarsConstants.MODALY + PillarsConstants.MODALH - 50;
    button.w = PillarsConstants.MENU_BUTTON_W * 2;
    button.h = PillarsConstants.MENU_BUTTON_H * 2;
    button.zindex = PillarsConstants.MODALZ + 2;
    button.onclick = () => {
        game.closeModal();
        if (callback) callback();
    };
    game.addMouseable(PillarsConstants.MODAL_KEY + '_nothanks', button);

    const player = game.gameState.currentPlayer;
    const inPlay = player.inPlay;
    const scale = 0.75;
    const offset = PillarsConstants.CARD_WIDTH * scale + 5;
    const numPerRow = 10;
    const voffset = PillarsConstants.CARD_HEIGHT * scale + 10;

    for (let i = 0; i < inPlay.length; i++) {
        const card = inPlay[i];

        const c = new MouseableCard(card);
        c.x = PillarsConstants.MODALX + 20 + ((i % numPerRow) * offset);
        c.y = PillarsConstants.MODALY + 200 + Math.floor(i / numPerRow) * voffset; 
        c.zindex = PillarsConstants.MODALZ + 1;
        c.render = () => {
            game.renderCard(c, false, scale);
        };
        c.onclick = () => {
            game.gameState.removeCardFromInPlay(game.gameState.currentPlayer, c.card);
            game.retireCard(c, callback);
        }
        game.addMouseable(PillarsConstants.MODAL_KEY + '_inplay_' + i, c);
    }

};

import { IPillarsGame, Mouseable, MouseableCard, Button } from '../ui-utils';
import { PillarsConstants } from '../constants';
import { IGame, ICardContainer } from '../../lambdas/card-actions';

/**
 * DDoS Attack.
 * 
 * You may retire a card you played this turn.
 */
export const ddosAttack = (g:IGame, 
    m: ICardContainer, 
    callback:Function, 
    winner?: boolean) => {

    const game = <IPillarsGame>g;
    const mcard = <MouseableCard>m;
    
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

        const m = new MouseableCard(card);
        m.x = PillarsConstants.MODALX + 20 + ((i % numPerRow) * offset);
        m.y = PillarsConstants.MODALY + 200 + Math.floor(i / numPerRow) * voffset; 
        m.zindex = PillarsConstants.MODALZ + 1;
        m.render = () => {
            game.renderCard(m, false, scale);
        };
        m.onclick = () => {
            game.gameState.removeCardFromInPlay(game.gameState.currentPlayer, m.card);
            game.retireCard(m, callback);
        }
        game.addMouseable(PillarsConstants.MODAL_KEY + '_inplay_' + i, m);
    }

};

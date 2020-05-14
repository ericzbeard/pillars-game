import { PillarsConstants } from '../constants';
import { IPillarsGame } from '../interfaces/pillars-game';
import { Modal } from '../ui-utils/modal';
import { MouseableCard } from '../ui-utils/mouseable-card';
import { Mouseable } from '../ui-utils/mouseable';
import { Button } from '../ui-utils/button';

/**
 * Throttled Bandwidth.
 * 
 * If you have any cards in play that provide Creativity, 
 * place one of them in the discard pile before rolling.
 * 
 * This is a special case that has to run before the roll instead of after.
 */
export class ThrottledBandwidth {

    /**
     * Explain what to do.
     */
    explain(game: IPillarsGame, callback: () => any, modal: Modal, m:MouseableCard) {

        const bkey = PillarsConstants.MODAL_KEY + '_throttled_choose';
        const tkey = PillarsConstants.MODAL_KEY + '_txt';

        const txt = new Mouseable();
        txt.x = PillarsConstants.MODALX + 1100;
        txt.y = PillarsConstants.MODALY + 350;
        txt.zindex = PillarsConstants.MODALZ + 2;
        txt.render = () => {
            game.ctx.font = game.getFont(28);
            game.ctx.fillStyle = PillarsConstants.COLOR_WHITEISH;
            game.ctx.textAlign = 'center';
            game.ctx.fillText('Choose cards to discard', txt.x, txt.y);
        }
        game.addMouseable(tkey, txt);

        // Show a button to choose the card
        const button = new Button('Ok', game.ctx);
        const w = 200;
        const h = 50;
        button.x = PillarsConstants.MODALX + 1000;
        button.y = PillarsConstants.MODALY + 400;
        button.w = w;
        button.h = h;
        button.zindex = PillarsConstants.MODALZ + 2;

        button.onclick = () => {
            game.removeMouseable(bkey);
            game.removeMouseable(tkey);
            game.removeMouseable(m.key);
            this.choose(game, callback, modal);
        }
        game.addMouseable(bkey, button);

    }

    /**
     * Choose the card to discard.
     */
    choose(game: IPillarsGame, callback: () => any, modal:Modal) {

        modal.text = 'Discard one of these cards';
        modal.hideCloseButton();

        const player = game.gameState.currentPlayer;
        const inPlay = player.inPlay;
        const scale = 0.75;
        const offset = PillarsConstants.CARD_WIDTH * scale + 5;
        const numPerRow = 10;
        const voffset = PillarsConstants.CARD_HEIGHT * scale + 10;

        for (let i = 0; i < inPlay.length; i++) {
            const card = inPlay[i];

            if (!card.provides || !card.provides.Creativity) {
                continue;
            }

            const m = new MouseableCard(card);
            m.x = PillarsConstants.MODALX + 20 + ((i % numPerRow) * offset);
            m.y = PillarsConstants.MODALY + 200 + Math.floor(i / numPerRow) * voffset;
            m.zindex = PillarsConstants.MODALZ + 1;
            m.render = () => {
                game.renderCard(m, false, scale);
            };
            m.onclick = () => {
                game.gameState.removeCardFromInPlay(game.gameState.currentPlayer, m.card);

                game.gameState.currentPlayer.numCreativity -= m.card.provides.Creativity;

                // This callback is the roll function inside of Trial.show()
                game.discard(m, callback);
                
                game.removeMouseableKeys(PillarsConstants.MODAL_KEY + '_inplay_');
            }
            game.addMouseable(PillarsConstants.MODAL_KEY + '_inplay_' + i, m);
        }
    }

}
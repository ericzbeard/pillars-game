import { IPillarsGame, Modal, MouseableCard, PillarsImages } from '../ui-utils';
import { Card } from '../../lambdas/card';
import { PillarsConstants } from '../constants';
import { retireCardFromHand } from './retire';

/**
 * Decommision.
 * 
 * Retire 1 or Retire this and add one credit.
 */
export const decommision = (game:IPillarsGame, 
                            mcard: MouseableCard, 
                            callback:Function) => {

    const modal = game.showModal(
        "Choose whether to retire a card from hand or " + 
        "retire this card and add one credit this turn");

    // Retire a card from hand
    const c1 = <Card>game.gameState.cardMasters.get('Decommision-1');
    const choice1 = new MouseableCard(c1);
    choice1.x = PillarsConstants.MODALW/2 - 300;
    choice1.y = PillarsConstants.MODALY + 200;
    choice1.w = PillarsConstants.CARD_WIDTH;
    choice1.h = PillarsConstants.CARD_HEIGHT;
    choice1.zindex = PillarsConstants.MODALZ + 1;

    choice1.onclick = () => {
        game.closeModal();
        retireCardFromHand(game, mcard, callback);
    };

    choice1.render = () => {
        game.renderCard(choice1);
    }
    
    game.addMouseable(PillarsConstants.MODAL_KEY + '_c1', choice1);
    game.renderCard(choice1, false);

    // Retire this card and $
    const c2 = <Card>game.gameState.cardMasters.get('Decommision-2');
    const choice2 = new MouseableCard(c2);
    choice2.x = PillarsConstants.MODALW/2 + (300 - PillarsConstants.CARD_WIDTH);
    choice2.y = PillarsConstants.MODALY + 200;
    choice2.w = PillarsConstants.CARD_WIDTH;
    choice2.h = PillarsConstants.CARD_HEIGHT;
    choice2.zindex = PillarsConstants.MODALZ + 1;

    choice2.onclick = () => {
        game.closeModal();
        
        // Add $
        game.localPlayer.numCredits++;

        // Retire this card
        mcard.card.retired = true;
        
        game.playSound('menuselect.wav');

        // TODO - Animate something to show the card being retired

        callback();
    };

    choice2.render = () => {
        game.renderCard(choice2);
    }

    game.addMouseable(PillarsConstants.MODAL_KEY + '_c2', choice2);
    game.renderCard(choice2, false);
    
}

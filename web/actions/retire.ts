import { IPillarsGame } from '../ui-utils';
import { Card } from '../../lambdas/card';

/**
 * Remove a card in hand from the game.
 */
export const retireCardFromHand = (game: IPillarsGame, card: Card, callback?:Function) => {

    // Show a modal with the hand, retire the one that gets clicked

    const modal = game.showModal(
        "Choose a card from your hand to retire");

    game.initHandOrDiscard(true, true, () => {
        game.playSound('menuselect.wav');
        card.retired = true;
        game.closeModal();
        if (callback) callback();
    });

}
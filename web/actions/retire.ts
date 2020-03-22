import { IPillarsGame, MouseableCard } from '../ui-utils';
import { Card } from '../../lambdas/card';

/**
 * Remove a card in hand from the game.
 */
export const retireCardFromHand = (game: IPillarsGame, mcard:MouseableCard, callback?:Function) => {

    // Show a modal with the hand, retire the one that gets clicked

    const modal = game.showModal(
        "Choose a card from your hand to retire");

    const modalClick = (cardToRetire:MouseableCard) => {
        game.playSound('menuselect.wav');
        cardToRetire.card.retired = true;
        game.gameState.retiredCards.push(cardToRetire.card);

        game.removeMouseable(cardToRetire.key);
        game.removeMouseable(cardToRetire.getInfoKey());
        game.gameState.removeCardFromHand(game.gameState.currentPlayer, cardToRetire.card);

        game.closeModal();
        if (callback) callback();
        game.broadcast(`${game.localPlayer.name} retired ${cardToRetire.card.name}`);
    }

    game.initHandOrDiscard(true, true, modalClick, mcard.card);

}
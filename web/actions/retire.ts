import { IPillarsGame, MouseableCard, PillarsSounds } from '../ui-utils';

/**
 * Remove a card in hand from the game.
 */
export const retireCardFromHand = (game: IPillarsGame, mcard:MouseableCard, callback?:Function) => {

    // Show a modal with the hand, retire the one that gets clicked

    const modal = game.showModal(
        "Choose a card from your hand to retire");

    const modalClick = (cardToRetire:MouseableCard) => {
        game.gameState.removeCardFromHand(game.gameState.currentPlayer, cardToRetire.card);
        game.retireCard(cardToRetire, callback);
    }

    game.initHandOrDiscard(true, true, modalClick, mcard.card);

}
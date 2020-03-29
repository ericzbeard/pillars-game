import { IPillarsGame, MouseableCard, PillarsSounds } from '../ui-utils';
import { Card } from '../../lambdas/card';
import { retireCardFromHand} from './retire';

/**
 * Discard 1, Then retire 1 from your hand.
 */
export const amazonKinesis = (game: IPillarsGame, mcard: MouseableCard, callback?:Function) => {

    // Show a modal with the hand, retire the one that gets clicked

    const modal = game.showModal(
        "Choose a card from your hand to discard");

    const modalClick = (cardToDiscard:MouseableCard) => {
        game.playSound(PillarsSounds.DISCARD);
        const player = game.gameState.currentPlayer;
        player.discardPile.push(cardToDiscard.card);
        game.removeMouseable(cardToDiscard.key);
        game.removeMouseable(cardToDiscard.getInfoKey());
        game.gameState.removeCardFromHand(player, cardToDiscard.card);
        game.closeModal();
        retireCardFromHand(game, mcard, callback);
        game.broadcast(`${game.localPlayer.name} discarded ${cardToDiscard.card.name}`);
    }

    game.initHandOrDiscard(true, true, modalClick, mcard.card);

}
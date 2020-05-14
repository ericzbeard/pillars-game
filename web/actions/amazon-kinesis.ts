import { PillarsSounds } from '../../lambdas/sounds';
import { StandardActions } from '../standard-actions';
import { IGame } from '../../lambdas/interfaces/game';
import { ICardContainer } from '../../lambdas/interfaces/card-container';
import { IPillarsGame } from '../interfaces/pillars-game';
import { MouseableCard } from '../ui-utils/mouseable-card';

/**
 * Discard 1, Then retire 1 from your hand.
 */
export const amazonKinesis = (g:IGame, 
    m: ICardContainer, 
    callback:() => any) => {

    const game = g as IPillarsGame;
    const mcard = m as MouseableCard;
    
    // Show a modal with the hand, retire the one that gets clicked

    const modal = game.showModal(
        "Choose a card from your hand to discard");

    const modalClick = async (cardToDiscard:MouseableCard) => {
        game.playSound(PillarsSounds.DISCARD);
        const player = game.gameState.currentPlayer;
        player.discardPile.push(cardToDiscard.card);
        game.removeMouseable(cardToDiscard.key);
        game.removeMouseable(cardToDiscard.getInfoKey());
        game.gameState.removeCardFromHand(player, cardToDiscard.card);
        game.closeModal();
        const sa = new StandardActions();
        sa.retireCardFromHand(game, mcard, callback);
        await game.broadcast(`${game.localPlayer.name} discarded ${cardToDiscard.card.name}`);
    }

    game.initHandOrDiscard(true, true, modalClick, mcard.card);

}
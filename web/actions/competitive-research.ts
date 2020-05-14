import { Card } from '../../lambdas/card';
import { Player } from '../../lambdas/player';
import { PillarsConstants } from '../constants';
import { CanvasUtil } from '../canvas-util';
import { IPillarsGame } from '../interfaces/pillars-game';
import { Mouseable } from '../ui-utils/mouseable';
import { IGame } from '../../lambdas/interfaces/game';
import { ICardContainer } from '../../lambdas/interfaces/card-container';
import { MouseableCard } from '../ui-utils/mouseable-card';

/**
 * Competitive Research.
 * 
 * Acquire a random card from an opponent's hand.
 */
export const competitiveResearch = (g:IGame, 
    m: ICardContainer, 
    callback:Function) => {

    const game = <IPillarsGame>g;
    const mcard = <MouseableCard>m;
    
    // Show a modal that allows the player to select an opponent.
    // Show how many cards are in that opponent's hand

    const modal = game.showModal('Acquire a random card from an opponent\'s hand');

    const w = 200;
    const h = 50;
    const offset = 20;
    const x = PillarsConstants.MODALX + PillarsConstants.MODALW/2 - (w * 3 + offset * 2) / 2;

    for (let i = 1; i < game.gameState.players.length; i++) {
        const p = game.gameState.players[i];

        const link = new Mouseable();
      
        link.x = x + ((i - 1) * (w + offset));
        link.y = PillarsConstants.MODALY + 300;
        link.w = w
        link.h = h;
        link.zindex = PillarsConstants.MODALZ + 1;
        link.data = p;

        link.render = () => {
            game.ctx.font = game.getFont(24);
            game.ctx.textAlign = 'center';
            game.ctx.fillStyle = PillarsConstants.COLOR_WHITEISH;
            game.ctx.fillText(p.name, link.x + w/2, link.y + 30, w);
            game.ctx.strokeStyle = PillarsConstants.COLOR_WHITEISH;
            CanvasUtil.roundRect(game.ctx, link.x, link.y, w, h, 5, false, true);
        };

        link.onclick = async () => {
            // Choose a random card
            const chosenPlayer = <Player>link.data;
            const index = Math.floor(Math.random() * chosenPlayer.hand.length);
            const card = chosenPlayer.hand[index];

            // Remove the card from their hand
            chosenPlayer.hand.splice(index, 1);

            // Add it to our discard pile
            game.gameState.currentPlayer.discardPile.push(card);

            // Close the modal and do the callback
            game.closeModal();
            callback();

            // Announce what happened
            await game.broadcast(`${game.localPlayer.name} acquired ${card.name} ` + 
                `from ${chosenPlayer.name}'s hand!`);
        }

        game.addMouseable(PillarsConstants.COMPETITIVE_RESEARCH_KEY + i, link);
    }
}
import { Card } from '../../lambdas/card';
import { Player } from '../../lambdas/player';
import { PillarsConstants } from '../constants';
import { CanvasUtil } from '../canvas-util';
import { IPillarsGame } from '../interfaces/pillars-game';
import { Mouseable } from '../ui-utils/mouseable';

/**
 * Bugs.
 *
 * When you acquire a bug, it goes in an opponent's discard pile. 
 */
export const bug = (game: IPillarsGame, card: Card, callback: () => any) => {

    // Show a modal that allows the player to select an opponent.
    // Show how many cards are in that opponent's hand

    const modal = game.showModal('Choose an opponent who will get the bug!');

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
            const chosenPlayer = link.data as Player;
            
            // Add it to their discard pile
            chosenPlayer.discardPile.push(card);

            // Close the modal and do the callback
            game.closeModal();
            callback();

            // Announce what happened
            await game.broadcast(`${game.localPlayer.name} put ${card.name} ` + 
                `into ${chosenPlayer.name}'s discard pile!`);
        }

        game.addMouseable(PillarsConstants.COMPETITIVE_RESEARCH_KEY + i, link);
    }
}
import { IPillarsGame, Modal, MouseableCard, PillarsImages } from '../ui-utils';
import { PillarsConstants } from '../constants';

/**
 * Promote (or demote) any pillar.
 * 
 * Choose a non-maxed pillar to promote.
 */
export const promoteAny = (game:IPillarsGame, callback?:Function, isDemote?: boolean) => {

    if (isDemote === undefined) {
        isDemote = false;
    }

    const pd = isDemote ? 'demote' : 'promote';
    const modal = game.showModal(`Choose a pillar to ${pd}`);
    modal.hideCloseButton();

    const cw = PillarsConstants.CARD_WIDTH * PillarsConstants.PILLAR_SCALE;
    const gap = 20;
    const w = (cw * 5) + (gap * 4);
    const x = PillarsConstants.MODALX + (PillarsConstants.MODALW - w) / 2;

    for (let i = 0; i < 5; i++) {
        const pillar = game.gameState.pillars[i];
        const m = new MouseableCard(game.gameState.pillars[i]);
        const offset = i * (cw + gap);
        m.x = x + offset;
        m.y = PillarsConstants.MODALY + 200;
        m.data = i;
        m.zindex = PillarsConstants.MODALZ + 1;
        m.render = () => {
            game.renderCard(m);
        }
        m.onclick = () => {
            game.gameState.promote(m.data, <boolean>isDemote);
            const numeral = PillarsConstants.NUMERALS[m.data];
            if (callback) callback();
            game.broadcast(`${game.gameState.currentPlayer.name} ${pd}d pillar ${numeral}`);
            game.closeModal();
        };
        game.addMouseable(PillarsConstants.MODAL_KEY + '_pillar_' + i, m);
    }
};
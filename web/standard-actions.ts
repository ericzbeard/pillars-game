
import { IPillarsGame, Mouseable, MouseableCard } from './ui-utils';
import { PillarsConstants } from './constants';
import { Button, DieRollAnimation } from './ui-utils';
import { PillarsSounds } from '../lambdas/sounds';

export class StandardActions {

    /**
     * Remove a card in hand from the game.
     */
    retireCardFromHand(game: IPillarsGame, mcard: MouseableCard, callback?: Function) {

        // Show a modal with the hand, retire the one that gets clicked

        const modal = game.showModal(
            "Choose a card from your hand to retire");

        const modalClick = (cardToRetire: MouseableCard) => {
            game.gameState.removeCardFromHand(game.gameState.currentPlayer, cardToRetire.card);
            game.retireCard(cardToRetire, callback);
        }

        game.initHandOrDiscard(true, true, modalClick, mcard.card);

    }

    /**
     * Promote (or demote)
     * 
     * Roll a d6 and promote that pillar, unless it's maxed.
     * 
     * On a 6, choose a non-maxed pillar to promote.
     */
    promote(game: IPillarsGame, callback?: Function, isDemote?: boolean) {

        if (isDemote === undefined) {
            isDemote = false;
        }
        let msg = 'Roll a d6 and promote that pillar! On a 6, you get to choose.';
        if (isDemote) {
            msg = 'Roll a d6 and demote that pillar. On a 6, you get to choose.'
        }
        const modal = game.showModal(msg);

        const DIEX = PillarsConstants.MODALX + PillarsConstants.MODALW / 2 - 50;
        const DIEY = PillarsConstants.MODALY + 350;

        const player = game.gameState.currentPlayer;

        // Show a button to roll
        const button = new Button('Roll!', game.ctx);
        const w = 200;
        const h = 50;
        button.x = PillarsConstants.MODALX + PillarsConstants.MODALW / 2 - w / 2;
        button.y = PillarsConstants.MODALY + 200;
        button.w = w;
        button.h = h;
        button.zindex = PillarsConstants.MODALZ + 1;
        button.text = 'Roll!'

        button.onclick = () => {
            const roll = Math.floor(Math.random() * 6) + 1;

            const a = new DieRollAnimation(game, roll, DIEX, DIEY, 0);
            game.registerAnimation(a);
            game.playSound(PillarsSounds.DICE);

            // Replace the animation with the actual number rolled after 1 second.
            setTimeout(() => {
                const die = new Mouseable();
                die.x = DIEX;
                die.y = DIEY;
                die.zindex = PillarsConstants.MODALZ + 2;
                die.render = () => {
                    DieRollAnimation.RenderDie(game, player.index, roll, die.x, die.y);
                };
                game.addMouseable(PillarsConstants.MODAL_KEY + '_promotedie', die);

                if (roll == 6) {
                    modal.hideCloseButton();
                    modal.text = `You rolled a 6! You get to choose the pillar.`;
                    button.text = 'Ok';
                    button.onclick = () => {
                        game.closeModal();
                        this.promoteAny(game, callback, isDemote);
                    };
                } else {
                    modal.hideCloseButton();
                    modal.text = `You rolled a ${roll}!`;
                    button.text = 'Ok';
                    button.onclick = () => {
                        game.gameState.promote(roll - 1, <boolean>isDemote);
                        const numeral = PillarsConstants.NUMERALS[roll - 1];
                        let pd = isDemote ? 'demoted' : 'promoted';
                        game.broadcast(`${player.name} ${pd} pillar ${numeral}`);
                        game.playSound(PillarsSounds.PROMOTE);
                        game.closeModal();
                        if (callback) callback();
                    };
                }
            }, 990);
        };

        game.addMouseable(PillarsConstants.MODAL_KEY + '_promote_roll_button', button);

    };

    /**
     * Promote (or demote) any pillar.
     * 
     * Choose a non-maxed pillar to promote.
     */
    promoteAny(game: IPillarsGame, callback?: Function, isDemote?: boolean) {

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
                game.broadcast(`${game.gameState.currentPlayer.name} ${pd}d pillar ${numeral}`);
                game.playSound(PillarsSounds.PROMOTE);
                game.closeModal();
                if (callback) callback();
            };
            game.addMouseable(PillarsConstants.MODAL_KEY + '_pillar_' + i, m);
        }
    };

}
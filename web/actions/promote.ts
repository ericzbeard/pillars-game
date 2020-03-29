import { IPillarsGame, Mouseable, Modal } from '../ui-utils';
import { Button, DieRollAnimation, PillarsSounds } from '../ui-utils';
import { PillarsConstants } from '../constants';
import { CanvasUtil } from '../canvas-util';
import { promoteAny } from './promote-any';

/**
 * Promote (or demote)
 * 
 * Roll a d6 and promote that pillar, unless it's maxed.
 * 
 * On a 6, choose a non-maxed pillar to promote.
 */
export const promote = (game: IPillarsGame, callback?:Function, isDemote?:boolean) => {

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
                    promoteAny(game, callback, isDemote);
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
                    game.closeModal();
                    if (callback) callback();
                };
            }
        }, 990);
    };

    game.addMouseable(PillarsConstants.MODAL_KEY + '_promote_roll_button', button);

};
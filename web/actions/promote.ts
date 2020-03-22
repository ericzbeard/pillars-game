import { IPillarsGame, Mouseable, Modal } from '../ui-utils';
import { Button, DieRollAnimation } from '../ui-utils';
import { PillarsConstants } from '../constants';
import { CanvasUtil } from '../canvas-util';
import { promoteAny } from './promote-any';

/**
 * Promote
 * 
 * Roll a d6 and promote that pillar, unless it's maxed.
 * 
 * On a 6, choose a non-maxed pillar to promote.
 */
export const promote = (game: IPillarsGame, callback?:Function) => {

    const modal = game.showModal('Roll a d6 and promote that pillar! On a 6, you get to choose');

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
        game.playSound('dice.wav');

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
                modal.text = `You rolled a 6! You get to choose which pillar to promote.`;
                button.text = 'Ok';
                button.onclick = () => {
                    game.closeModal();
                    promoteAny(game, callback);
                };
            } else {
                modal.hideCloseButton();
                modal.text = `You rolled a ${roll}!`;
                button.text = 'Ok';
                button.onclick = () => {
                    game.gameState.promote(roll - 1);
                    const numeral = PillarsConstants.NUMERALS[roll - 1];
                    game.broadcast(`${player.name} promoted pillar ${numeral}`);
                    game.closeModal();
                    if (callback) callback();
                };
            }
        }, 990);
    };

    game.addMouseable(PillarsConstants.MODAL_KEY + '_promote_roll_button', button);

};
import { IPillarsGame, Mouseable, Modal } from '../ui-utils';
import { PillarsAnimation } from '../ui-utils';
import { PillarsConstants } from '../constants';
import { CanvasUtil } from '../canvas-util';

/**
 * A die animation. Highlight the die when it changes.
 */
class PromoteAnimation extends PillarsAnimation {

    static readonly DIEX = PillarsConstants.MODALX + PillarsConstants.MODALW / 2 - 50;
    static readonly DIEY = PillarsConstants.MODALY + 350;

    constructor(private game: IPillarsGame, private roll:number) {
        super();
    }

    static GetKey(playerIndex: number) {
        return `Promote_${playerIndex}`;
    }

    getKey() {
        return PromoteAnimation.GetKey(this.game.gameState.currentPlayer.index);
    }

    /**
     * Render the die being rolled on the modal.
     */
    static RenderDie(game: IPillarsGame, playerIndex: number, rank: number) {

        const img = game.getImg(game.getDieName(playerIndex, rank));

        const x = PromoteAnimation.DIEX;
        const y = PromoteAnimation.DIEY;
        const scale = 2;

        if (img) {
            game.ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        }
    }

    /**
     * Render the die being rolled on the modal.
     */
    renderDie(playerIndex: number, rank: number) {
        PromoteAnimation.RenderDie(this.game, playerIndex, rank);
    }

    animate(ctx: CanvasRenderingContext2D, deleteSelf: Function) {
        const elapsed = this.getElapsedTime();
        const end = 1000;
        if (elapsed >= end) {
            deleteSelf(this.getKey());
        } else {
            this.percentComplete = elapsed / end;
            let rank = (elapsed % 6) + 1;

            if (this.percentComplete > 0.9) {
                // Show the final roll at the end of the animation
                rank = this.roll;
            }

            const p = this.game.gameState.currentPlayer;

            this.renderDie(p.index, rank);

        }
    }
}

/**
 * Promote
 * 
 * Roll a d6 and promote that pillar, unless it's maxed.
 * 
 * On a 6, choose a non-maxed pillar to promote.
 */
export const promote = (game: IPillarsGame, callback?:Function) => {

    const modal = game.showModal('Roll a d6 and promote that pillar! On a 6, you get to choose');

    const player = game.gameState.currentPlayer;

    // Show a button to roll
    const button = new Mouseable();
    const w = 200;
    const h = 50;
    button.x = PillarsConstants.MODALX + PillarsConstants.MODALW / 2 - w / 2;
    button.y = PillarsConstants.MODALY + 200;
    button.w = w;
    button.h = h;
    button.zindex = PillarsConstants.MODALZ + 1;
    button.data = 'Roll!'

    button.render = () => {
        game.ctx.font = game.getFont(24);
        game.ctx.textAlign = 'center';
        game.ctx.fillStyle = PillarsConstants.COLOR_WHITEISH;
        game.ctx.fillText(button.data, button.x + w / 2, button.y + 30, w);
        game.ctx.strokeStyle = PillarsConstants.COLOR_WHITEISH;
        CanvasUtil.roundRect(game.ctx, button.x, button.y, w, h, 5, false, true);
    };

    button.onclick = () => {
        const roll = Math.floor(Math.random() * 6) + 1;

        const a = new PromoteAnimation(game, roll);
        game.registerAnimation(a);
        game.playSound('dice.wav');

        // Replace the animation with the actual number rolled after 1 second.
        setTimeout(() => {
            const die = new Mouseable();
            die.x = PromoteAnimation.DIEX;
            die.y = PromoteAnimation.DIEY;
            die.zindex = PillarsConstants.MODALZ + 2;
            die.render = () => {
                PromoteAnimation.RenderDie(game, player.index, roll);
            };
            game.addMouseable(PillarsConstants.MODAL_KEY + '_promotedie', die);

            if (roll == 6) {
                button.data = 'Choose a Pillar!';

                // TODO - Call promote-any

            } else {
                modal.hideCloseButton();
                modal.text = `You rolled a ${roll}!`;
                button.data = 'Ok';
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
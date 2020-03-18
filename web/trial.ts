import { MouseableCard, IPillarsGame, Button, DieRollAnimation, Mouseable } from './ui-utils';
import { PillarsConstants } from './constants';

export class Trial {


    /**
     * 
     */
    constructor(private game: IPillarsGame) {

    }

    /**
     * Show the trial.
     */
    show() {
        const player = this.game.localPlayer;
        const ctx = this.game.ctx;
        const game = this.game;
        const numCreativity = player.numCreativity;

        const modal = this.game.showModal(`Time to face a trial! ` + 
            `You have ${numCreativity} creativity.`);

        // We only need to show a single card, the trial being faced
        const phase = this.game.localPlayer.getCurrentTrialPhase();
        const stack = this.game.gameState.trialStacks[phase - 1];
        this.game.gameState.checkTrialStack(stack);
        const card = stack.notused[0];

        const m = new MouseableCard(card);
        m.x = PillarsConstants.MODALX + 300;
        m.y = PillarsConstants.MODALY + 150;
        m.zindex = PillarsConstants.MODALZ + 1;

        m.render = () => {
            this.game.renderCard(m, false, 2);
        };

        this.game.addMouseable(PillarsConstants.MODAL_KEY + '_trialcard', m);

        // // Dice rolling area
        // const area = new Mouseable();
        // area.zindex = PillarsConstants.MODALZ + 1;
        // area.render = () => {
        //     ctx.fillStyle = 'green';
        //     ctx.strokeStyle = 'brown';
        //     ctx.lineWidth = 10;
        //     ctx.beginPath();
        //     ctx.arc(PillarsConstants.MODALX + 800, PillarsConstants.MODALY + 300, 100, 0, 2 * Math.PI);
        //     ctx.fill();
        //     ctx.stroke();
        //     ctx.lineWidth = 1;
        // };
        // this.game.addMouseable(PillarsConstants.MODAL_KEY + '_dice_roll_area', area);

        // TODO - Handle custom trial rules

        // Show a button to roll
        const button = new Button('Roll!', this.game.ctx);
        const w = 200;
        const h = 50;
        button.x = PillarsConstants.MODALX + 800;
        button.y = PillarsConstants.MODALY + 200;
        button.w = w;
        button.h = h;
        button.zindex = PillarsConstants.MODALZ + 1;
        button.text = 'Roll!'

        const DIE0X = button.x - 20;
        const DIE0Y = button.y + 70;
        const DIE1X = button.x + 90;
        const DIE1Y = button.y + 180;

        button.onclick = () => {
            const roll0 = Math.floor(Math.random() * 6) + 1;
            const roll1 = Math.floor(Math.random() * 6) + 1;
            const roll = roll0 + roll1;
            const total = roll + numCreativity;

            const a0 = new DieRollAnimation(game, roll0, DIE0X, DIE0Y, 0);
            game.registerAnimation(a0);
            const a1 = new DieRollAnimation(game, roll1, DIE1X, DIE1Y, 1);
            game.registerAnimation(a1);
            game.playSound('dice.wav');

            // Replace the animation with the actual number rolled after 1 second.
            setTimeout(() => {
                const die0 = new Mouseable();
                die0.x = DIE0X;
                die0.y = DIE0Y;
                die0.zindex = PillarsConstants.MODALZ + 2;
                die0.render = () => {
                    DieRollAnimation.RenderDie(game, player.index, roll0, die0.x, die0.y);
                };
                game.addMouseable(PillarsConstants.MODAL_KEY + '_trial_die_0', die0);

                const die1 = new Mouseable();
                die1.x = DIE1X;
                die1.y = DIE1Y;
                die1.zindex = PillarsConstants.MODALZ + 2;
                die1.render = () => {
                    DieRollAnimation.RenderDie(game, player.index, roll1, die1.x, die1.y);
                };
                game.addMouseable(PillarsConstants.MODAL_KEY + '_trial_die_1', die1);

                modal.hideCloseButton();
                const winner = total >= card.trial;
                const sf = winner ? 'Success' : 'Failure';
                modal.text = `You rolled ${roll}. Your total is ${total}. ${sf}!`;
                button.text = 'Ok';
                button.onclick = () => {
                        
                    // TODO - Success and failure

                    game.closeModal();
                    game.endTurn();
                }
            }, 990);
        };

        this.game.addMouseable(PillarsConstants.MODAL_KEY + '_trial_roll_btn', button);

        this.game.resizeCanvas();

    }

}
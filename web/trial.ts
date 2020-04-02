import { MouseableCard, IPillarsGame, Button, DieRollAnimation, Mouseable } from './ui-utils';
import { PillarsSounds } from './ui-utils';
import { PillarsConstants } from './constants';
import { CardActions } from './card-actions';  
import { ThrottledBandwidth } from './actions/throttled-bandwidth';

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


        // We only need to show a single card, the trial being faced
        const phase = this.game.localPlayer.getCurrentTrialPhase();
        const stack = this.game.gameState.trialStacks[phase - 1];
        this.game.gameState.checkTrialStack(stack);
        const card = stack.notused[0];
        game.broadcast(`${player.name} is facing a trial: ${card.name}`);

        const add = card.add ? player.pillarRanks[card.pillarIndex || 0] : 0;
        let numCreativity = player.numCreativity + add;

        const msg = `Time to face a trial! You have ${numCreativity} creativity.`;
        let modal = this.game.showModal(msg);

        // Show the trial card
        const showTrialCard = (): MouseableCard => {

            const m = new MouseableCard(card);
            m.x = PillarsConstants.MODALX + 300;
            m.y = PillarsConstants.MODALY + 150;
            m.zindex = PillarsConstants.MODALZ + 1;

            m.render = () => {
                this.game.renderCard(m, false, 2);
            };

            this.game.addMouseable(PillarsConstants.MODAL_KEY + '_trialcard', m);

            return m;
        }

        // Roll the dice
        const roll = (m:MouseableCard) => {

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
                game.playSound(PillarsSounds.DICE);

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
                    const wonlost = winner ? 'won' : 'lost';
                    this.game.broadcast(`${player.name} rolled ${roll} (+${numCreativity} ` + 
                        `Creativity) and ${wonlost} the trial!`);

                    if (winner) {
                        this.game.playSound(PillarsSounds.SUCCESS);
                    } else {
                        this.game.playSound(PillarsSounds.FAIL);
                    }
                    const sf = winner ? 'Success' : 'Failure';
                    modal.text = `You rolled ${roll}. Your total is ${total}. ${sf}!`;
                    button.text = 'Ok';
                    button.onclick = () => {
                        const actions = new CardActions(this.game, m, (drawNum?:number) => {
                            const shuffled = game.gameState.endTrial(stack, winner, drawNum);
                            if (shuffled) {
                                game.playSound(PillarsSounds.SHUFFLE);
                            }
                            game.closeModal();
                            game.endTurn();
                        });
                        actions.endTrial(winner);
                    }
                }, 990);
            };

            this.game.addMouseable(PillarsConstants.MODAL_KEY + '_trial_roll_btn', button);

            this.game.resizeCanvas();
        
        };

        // Look at cards in play and see if any of them provide creativity
        
        const inPlay = player.inPlay;
        let hasCreativity = false;
        for (let i = 0; i < inPlay.length; i++) {
            const card = inPlay[i];

            if (card.provides && card.provides.Creativity) {
                hasCreativity = true;
                break;
            }
        }

        // Check to see if there are any special actions to take before rolling
        if (card.name == 'Throttled Bandwidth' && hasCreativity) {

            let m = showTrialCard();

            const after = () => {
                numCreativity = player.numCreativity + add;
                modal = this.game.showModal(
                    `Time to face a trial! You have ${numCreativity} creativity.`);
                m = showTrialCard();
                roll(m);
            }
            const t = new ThrottledBandwidth();
            t.explain(game, after, modal, m);

        } else {
            const m = showTrialCard();
            roll(m);
        }

    }

}
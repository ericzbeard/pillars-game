import { IPillarsGame, Modal, MouseableCard, PillarsImages } from './ui-utils';
import { Mouseable } from './ui-utils';
import { Card } from '../lambdas/card';
import { PillarsConstants } from './constants';

/**
 * Custom card action logic is handled here.
 */
export class CardActions {

    customEffects: Map<string, Function>;

    static readonly SCALE = 1.5;

    /**
     * The callback is called when we are done with any custom actions.
     */
    constructor(
        public game: IPillarsGame,
        public card: Card,
        public callback: Function) {

        this.customEffects = new Map<string, Function>();

        this.customEffects.set("Decommision", this.decommision);
        this.customEffects.set("Predictive Autoscaling", this.predictiveAutoscaling);

        // Ops Workshop
        // Security Workshop
        // Reliability Workshop
        // Performance Workshop
        // Predictive Autoscaling
        // Competitive Research
        // CloudFormation
        // Poach
        // Guard Duty
        // Chaos Testing
        // Think Tank
        // Talented Jerk (maybe throw in an Easter Egg. "Well, actually...")
        // Promoted to VP
        // Cloud 9
        // Outsourcing
        // Senior Developer
        // AWS Lambda
        // SQS
        // EBS Volume
        // Stack Overflow
        // S3 Bucket
        // First to Market
        // WAF
        // Job Fair
        // Forecast
        // Sagemaker
        // Database Migration
        // Collaboration
        // Patent Awarded

    }

    /**
     * Play the card's effects.
     */
    play() {
        this.doStandardEffects(this.card);
        // Some cards need special handling for custom conditions
        const a = this.customEffects.get(this.card.name);
        if (a) {
            a.call(this);
        } else {
            this.callback();
        }
    }

    /**
     * Do the regular effects like adding resources and drawing cards.
     * 
     * Returns false if we should cancel
     */
    doStandardEffects(card: Card) {

        const player = this.game.localPlayer;


        if (card.action) {
            if (card.action.Retire) {
                this.retireCardFromHand();
            }
            if (card.action.Promote) {
                // 0-4 means that pillar
                // 5 means any
                // 6 means roll a d6
            }
            if (card.action.Draw) {
                for (let i = 0; i < card.action.Draw; i++) {
                    this.game.gameState.drawOne(player);
                }
            }
        }

        if (card.conditionalAction) {
            if (card.conditionalAction.Draw) {
                if (card.conditionalAction.Pillar) {
                    const rank = player.pillarRanks[card.conditionalAction.Pillar.Index];
                    if (rank >= card.conditionalAction.Pillar.Rank) {
                        for (let i = 0; i < card.conditionalAction.Draw; i++) {
                            this.game.gameState.drawOne(player);
                        }
                    }
                }
            }
        }

        if (card.provides) {
            if (card.provides.Talent) {
                player.numTalents += card.provides.Talent;
            }
            if (card.provides.Credit) {
                player.numCredits += card.provides.Credit;
            }
            if (card.provides.Creativity) {
                player.numCreativity += card.provides.Creativity;
            }
            if (card.provides.Customer) {
                player.numCustomers += card.provides.Customer;
            }
            if (card.provides.CreditByPillar) {
                player.numCredits += player.pillarRanks[card.provides.CreditByPillar];
            }
            if (card.provides.TalentByPillar) {
                player.numTalents += player.pillarRanks[card.provides.TalentByPillar];
            }
            if (card.provides.CreativityByPillar) {
                player.numCreativity += player.pillarRanks[card.provides.CreativityByPillar];
            }
        }


    }

    /**
     * Remove a card in hand from the game.
     * 
     */
    retireCardFromHand() {

        // Show a modal with the hand, retire the one that gets clicked
        
        const modal = this.game.showModal(
            "Choose a card from your hand to retire");

        this.game.initHandOrDiscard(true, true, () => {
            this.game.playSound('menuselect.wav');
            this.card.retired = true;
            this.game.closeModal();
            this.callback();
        });


    }

    /**
     * Retire 1 or Retire this and add one credit.
     */
    decommision() {

        const modal = this.game.showModal(
            "Choose whether to retire a card from hand or " + 
            "retire this card and add one credit this turn");

        // Retire a card from hand
        const c1 = <Card>this.game.gameState.cardMasters.get('Decommision-1');
        const choice1 = new MouseableCard(c1);
        choice1.x = PillarsConstants.MODALW/2 - 300;
        choice1.y = PillarsConstants.MODALY + 200;
        choice1.w = PillarsConstants.CARD_WIDTH;
        choice1.h = PillarsConstants.CARD_HEIGHT;
        choice1.zindex = PillarsConstants.MODALZ + 1;

        choice1.onclick = () => {
            this.game.closeModal();
            this.retireCardFromHand();
        };

        choice1.render = () => {
            this.game.renderCard(choice1);
        }
        
        this.game.addMouseable(PillarsConstants.MODAL_KEY + '_c1', choice1);
        this.game.renderCard(choice1, false);

        // Retire this card and $
        const c2 = <Card>this.game.gameState.cardMasters.get('Decommision-2');
        const choice2 = new MouseableCard(c2);
        choice2.x = PillarsConstants.MODALW/2 + (300 - PillarsConstants.CARD_WIDTH);
        choice2.y = PillarsConstants.MODALY + 200;
        choice2.w = PillarsConstants.CARD_WIDTH;
        choice2.h = PillarsConstants.CARD_HEIGHT;
        choice2.zindex = PillarsConstants.MODALZ + 1;

        choice2.onclick = () => {
            this.game.closeModal();
            
            // Add $
            this.game.localPlayer.numCredits++;

            // Retire this card
            this.card.retired = true;
            
            this.game.playSound('menuselect.wav');

            // TODO - Animate something to show the card being retired

            this.callback();
        };

        choice2.render = () => {
            this.game.renderCard(choice2);
        }

        this.game.addMouseable(PillarsConstants.MODAL_KEY + '_c2', choice2);
        this.game.renderCard(choice2, false);
        
    }

    /**
     * Look at the top card of any trial stack. 
     * You may put it on the bottom of that stack face up.
     */
    predictiveAutoscaling() {

        const modal = this.game.showModal(
            "Look at the top card of any trial stack. " + 
            "You may put it on the bottom of that stack face up.");

        const scale = CardActions.SCALE;

        const offset = PillarsConstants.CARD_WIDTH * scale + 50 * scale;
        let w = offset * 3;

        let x = PillarsConstants.MODALX + PillarsConstants.MODALW / 2 - w / 2;
        let y = PillarsConstants.MODALY + 250;

        this.game.ctx.font = this.game.getFont(12);
        this.game.ctx.fillStyle = PillarsConstants.COLOR_WHITEISH;

        const topOrBottom = (index:number) => {
            this.game.showModal('Leave the trial on top or put it on the bottom');

            const stack = this.game.gameState.trialStacks[index];
            this.game.gameState.checkTrialStack(stack);
            const trialCardName = stack.notused[0].name;
            
            const topCard = Object.assign(new Card(), 
                this.game.gameState.cardMasters.get('Predictive Autoscaling'));
            topCard.action = undefined;
            topCard.bigtext = 'Top';
            topCard.text = undefined;
            topCard.name = '';
            topCard.category = undefined;
            topCard.cost = undefined;
            topCard.hideType = true;
            const top = new MouseableCard(topCard);
            top.x = PillarsConstants.MODALX + PillarsConstants.MODALW / 2 - w / 2;
            top.y = y;
            top.zindex = PillarsConstants.MODALZ + 1;
            top.render = () => {
                this.game.renderCard(top, false, scale);
            };
            top.onclick = () => {
                this.game.closeModal();
                this.callback();
                this.game.broadcast(`${this.game.gameState.currentPlayer.name} ` + 
                    `looked at trial stack ${index + 1} and left the card on top`);
            };
            this.game.addMouseable(PillarsConstants.MODAL_KEY + '_top', top);

            // Show the trial
            const trialCard = stack.notused[0];
            const trial = new MouseableCard(trialCard);
            trial.x = top.x + offset;
            trial.y = top.y;
            trial.zindex = top.zindex;
            trial.render = () => {
                this.game.renderCard(trial, false, scale);
            };
            this.game.addMouseable(PillarsConstants.MODAL_KEY + '_trial', trial);

            const bottomCard = Object.assign(new Card(), 
                this.game.gameState.cardMasters.get('Predictive Autoscaling'));
            bottomCard.action = undefined;
            bottomCard.bigtext = 'Bottom';
            bottomCard.text = undefined;
            bottomCard.name = '';
            bottomCard.category = undefined;
            bottomCard.cost = undefined;
            bottomCard.hideType = true;
            const bottom = new MouseableCard(bottomCard);
            bottom.x = trial.x + offset;
            bottom.y = trial.y;
            bottom.zindex = trial.zindex;
            bottom.render = () => {
                this.game.renderCard(bottom, false, scale);
            };
            bottom.onclick = () => {
                this.game.closeModal();
                const t = stack.notused.shift();
                stack.used.push(<Card>t);
                this.callback();
                this.game.broadcast(`${this.game.gameState.currentPlayer.name} ` + 
                    `put ${trialCardName} on the bottom of the trial stack`);
            };
            this.game.addMouseable(PillarsConstants.MODAL_KEY + '_bottom', bottom);

        };

        const textoffset = (PillarsConstants.CARD_WIDTH * scale) / 2;

        // Phase 1
        const p1 = new Mouseable();
        p1.x = x;
        p1.y = y;
        p1.w = PillarsConstants.CARD_WIDTH * scale;
        p1.h = PillarsConstants.CARD_HEIGHT * scale;
        p1.zindex = PillarsConstants.MODALZ + 1;
        p1.render = () => {
            this.game.ctx.fillText('Phase 1', p1.x + textoffset, p1.y - 10);
            this.game.renderCardImage(PillarsImages.IMG_BACK_GREEN, p1.x, p1.y, scale);
            this.game.renderCardImage(PillarsImages.IMG_BACK_GREEN, p1.x + 5, p1.y + 5, scale);
        };
        p1.onclick = () => {
            this.game.closeModal();
            topOrBottom(0);
        };
        this.game.addMouseable(PillarsConstants.MODAL_KEY + '_p1', p1);

        x += offset;

        // Phase 2
        const p2 = new Mouseable();
        p2.x = x;
        p2.y = y;
        p2.w = PillarsConstants.CARD_WIDTH * scale;
        p2.h = PillarsConstants.CARD_HEIGHT * scale;
        p2.zindex = PillarsConstants.MODALZ + 1;
        p2.render = () => {
            this.game.ctx.fillText('Phase 2', p2.x + textoffset, p2.y - 10);
            this.game.renderCardImage(PillarsImages.IMG_BACK_ORANGE, p2.x, p2.y, scale);
            this.game.renderCardImage(PillarsImages.IMG_BACK_ORANGE, p2.x + 5, p2.y + 5, scale);
        };
        p2.onclick = () => {
            this.game.closeModal();
            topOrBottom(1);
        };
        this.game.addMouseable(PillarsConstants.MODAL_KEY + '_p2', p2);

        // Phase 3
        x += offset;
        const p3 = new Mouseable();
        p3.x = x;
        p3.y = y;
        p3.w = PillarsConstants.CARD_WIDTH * scale;
        p3.h = PillarsConstants.CARD_HEIGHT * scale;
        p3.zindex = PillarsConstants.MODALZ + 1;
        p3.render = () => {
            this.game.ctx.fillText('Phase 3', p3.x + textoffset, p3.y - 10);
            this.game.renderCardImage(PillarsImages.IMG_BACK_PINK, p3.x, p3.y, scale);
            this.game.renderCardImage(PillarsImages.IMG_BACK_PINK, p3.x + 5, p3.y + 5, scale);
        };
        p3.onclick = () => {
            this.game.closeModal();
            topOrBottom(2);
        };
        this.game.addMouseable(PillarsConstants.MODAL_KEY + '_p3', p3);
    }

}
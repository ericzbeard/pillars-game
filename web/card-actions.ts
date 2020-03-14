import { IPillarsGame, Modal, MouseableCard } from './ui-utils';
import { Card } from '../lambdas/card';
import { PillarsConstants } from './constants';

/**
 * Custom card action logic is handled here.
 */
export class CardActions {

    customEffects: Map<string, Function>;

    /**
     * The callback is called when we are done with any custom actions.
     */
    constructor(
        public game: IPillarsGame,
        public card: Card,
        public callback: Function) {

        this.customEffects = new Map<string, Function>();

        this.customEffects.set("Decommision", this.decommision);

        // Decommision
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

}
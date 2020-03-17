import { IPillarsGame, Modal, MouseableCard, PillarsImages } from './ui-utils';
import { Mouseable } from './ui-utils';
import { Card } from '../lambdas/card';
import { Player } from '../lambdas/player';
import { PillarsConstants } from './constants';
import { decommision } from './actions/decommision';
import { predictiveAutoscaling } from './actions/predictive-autoscaling';
import { competitiveResearch } from './actions/competitive-research';
import { retireCardFromHand } from './actions/retire';
import { promoteAny } from './actions/promote-any';
import { promote } from './actions/promote';

/**
 * Custom card action logic is handled here.
 * 
 * See the actions folder for card-specific custom actions.
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

        this.customEffects.set("Decommision", decommision);
        this.customEffects.set("Predictive Autoscaling", predictiveAutoscaling);
        this.customEffects.set("Competitive Research", competitiveResearch);

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
       

        // Some cards need special handling for custom conditions
        const a = this.customEffects.get(this.card.name);
        if (a) {
            this.doStandardEffects(this.card);
            a.call(this, this.game, this.card, this.callback);
        } else {
            this.doStandardEffects(this.card, this.callback);
        }
    }

    /**
     * Do the regular effects like adding resources and drawing cards.
     * 
     * Returns false if we should cancel
     */
    doStandardEffects(card: Card, callback?:Function) {

        const player = this.game.localPlayer;
        let delegatedCallback = false;


        if (card.action) {

            // Retire
            if (card.action.Retire) {
                retireCardFromHand(this.game, this.card);
            }

            // Promote
            if (card.action.Promote !== undefined) {

                // 0-4 means that pillar
                if (card.action.Promote < 5) {

                    // Modify game state
                    this.game.gameState.promote(card.action.Promote);

                    const numeral = PillarsConstants.NUMERALS[card.action.Promote];
                    this.game.broadcast(`${player.name} promoted pillar ${numeral}`);


                }

                // 5 means any
                if (card.action.Promote == 5) {
                    promoteAny(this.game, callback);
                    if (callback) {
                        delegatedCallback = true;
                    }
                }

                // 6 means roll a d6 (6 means any)
                if (card.action.Promote == 6) {

                    // Roll a d6
                    promote(this.game, this.callback);
                    if (callback) {
                        delegatedCallback = true;
                    }
                }
            }

            // Draw
            if (card.action.Draw) {
                for (let i = 0; i < card.action.Draw; i++) {
                    this.game.gameState.drawOne(player);
                }
            }
        }

        // Conditional Actions
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

        // Provides resources or customers
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

        // Check to see if we need to call the callback now
        if (callback && !delegatedCallback) {
            callback();
        }

    }


}
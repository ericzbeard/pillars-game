import { IPillarsGame } from './ui-utils';
import { Card } from '../lambdas/card';

/**
 * Custom card action logic is handled here.
 */
export class CardActions {

    customActions: Map<string, Function>;
    game: IPillarsGame;

    constructor(game: IPillarsGame) {
        this.game = game;
        this.customActions = new Map<string, Function>();

        this.customActions.set("Decommision", this.decommision);
        
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
     * Do the regular actions like adding resources and drawing cards.
     */
    doStandardActions(card:Card) {

        const player = this.game.localPlayer;

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

    }

    /**
     * Remove a card in hand from the game.
     */
    retireCardFromHand() {

        // Show a modal with the hand
        
    }

    /**
     * Retire 1 or Retire this and add one credit.
     */
    decommision() {

        // TODO - Ask the user which they want to choose
        // (Need to implement a modal dialog...)

        // If they choose Retire 1, let them choose a card from hand.
        // Another modal?

    }

}
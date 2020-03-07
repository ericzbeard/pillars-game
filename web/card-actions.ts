import { IPillarsGame } from './ui-utils';

/**
 * Custom card action logic is handled here.
 */
export class CardActions {

    actions: Map<string, Function>;
    game: IPillarsGame;

    constructor(game: IPillarsGame) {
        this.game = game;
        this.actions = new Map<string, Function>();

        this.actions.set("Decommision", this.decommision);
        
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
        // Talented Jerk
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
     * Retire 1 or Retire this and add one credit.
     */
    decommision() {

        // TODO - Ask the user which they want to choose
        // (Need to implement a modal dialog...)

        // If they choose Retire 1, let them choose a card from hand.
        // Another modal?

    }

}
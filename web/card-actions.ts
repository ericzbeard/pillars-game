import { IPillarsGame, Modal, MouseableCard, PillarsSounds } from './ui-utils';
import { Card } from '../lambdas/card';
import { PillarsConstants } from './constants';
import { decommision } from './actions/decommision';
import { predictiveAutoscaling } from './actions/predictive-autoscaling';
import { competitiveResearch } from './actions/competitive-research';
import { retireCardFromHand } from './actions/retire';
import { promoteAny } from './actions/promote-any';
import { promote } from './actions/promote';
import { amazonKinesis } from './actions/amazon-kinesis';
import { ddosAttack } from './actions/ddos-attack';
import { talentShortage } from './actions/talent-shortage';
import { dataCenterMigration } from './actions/data-center-migration';
import { employeesPoached } from './actions/employees-poached';
import { ResourceAnimation, PillarsImages } from './ui-utils';

/**
 * This is the signature for a custom card effect.
 * 
 * mcard is the card being played, which generally ends up being different 
 * than the card that gets affected. Be careful with differentiating them, 
 * e.g. mcard is not cardToRetire or cardToDiscard.
 */
export type CustomEffect = (game: IPillarsGame,
    mcard: MouseableCard,
    callback: Function, 
    winner?: boolean) => any;

/**
 * Custom card action logic is handled here.
 * 
 * See the actions folder for card-specific custom actions.
 */
export class CardActions {

    customEffects: Map<string, CustomEffect>;
    card: Card;

    /**
     * The callback is called when we are done with any custom actions.
     */
    constructor(
        public game: IPillarsGame,
        public mcard: MouseableCard,
        public callback: Function) {

        this.card = mcard.card;

        this.customEffects = new Map<string, CustomEffect>();

        this.customEffects.set("Decommision", decommision);
        this.customEffects.set("Predictive Autoscaling", predictiveAutoscaling);
        this.customEffects.set("Competitive Research", competitiveResearch);
        this.customEffects.set("Amazon Kinesis", amazonKinesis);
        this.customEffects.set("DDoS Attack", ddosAttack);
        this.customEffects.set("Talent Shortage", talentShortage);
        this.customEffects.set("Data Center Migration", dataCenterMigration);
        this.customEffects.set('Employees Poached', employeesPoached);

    }

    /**
     * Do success or fail actions.
     */
    endTrial(winner: boolean) {

        const a = this.customEffects.get(this.card.name);
        if (a) {
            this.doTrialEffects(winner, this.mcard);
            a.call(this, this.game, this.mcard, this.callback, winner);
        } else {
            this.doTrialEffects(winner, this.mcard, this.callback);
        }

    }

    /**
     * Do the standard trial effects.
     */
    doTrialEffects(winner:boolean, mcard:MouseableCard, trialCallback?:Function) {

        const player = this.game.gameState.currentPlayer;
        const card = this.card;
        let delegatedCallback = false;

        this.game.closeModal();

        if (winner) {
            if (card.success) {
                if (card.success.customers !== undefined) {
                    const n = card.success.customers
                    player.numCustomers += n;
                    this.game.playSound(PillarsSounds.CUSTOMER);
                    const s = n > 1 ? 's' : '';
                    this.game.broadcast(`${player.name} won ${n} customer${s}`);
                }
                if (card.success.promote !== undefined) {
                    if (card.success.promote == 6) {
                        promote(this.game, trialCallback);
                        delegatedCallback = true;
                    }
                    if (card.success.promote < 5) {
                        this.promotePillar(card.success.promote, false);
                    }
                    if (card.success.promote == 5) {
                        promoteAny(this.game, trialCallback);
                        delegatedCallback = true;
                    }
                }
            }
        } else {
            if (card.fail) {
                if (card.fail.customers !== undefined) {
                    const n = Math.abs(card.fail.customers);
                    if (player.numCustomers > 0) {
                        player.numCustomers -= n;
                        const s = n > 1 ? 's' : '';
                        this.game.broadcast(`${player.name} lost ${n} customer${s}.`);
                    } else {
                        this.game.broadcast(`${player.name} is already at zero customers.`);
                    }
                }
                if (card.fail.demote !== undefined) {
                    if (card.fail.demote < 5) {
                        promote(this.game, trialCallback, true);
                        delegatedCallback = true;
                    }
                    if (card.fail.demote == 5) {
                        this.promotePillar(card.fail.demote, true);
                    }
                    if (card.fail.demote == 6) {
                        promoteAny(this.game, trialCallback, true);
                        delegatedCallback = true;
                    }
                }
            }
        }

        if (trialCallback && !delegatedCallback) {
            trialCallback();
        }
    }

    /**
     * Play the card's effects.
     */
    play() {
        // Some cards need special handling for custom conditions
        const a = this.customEffects.get(this.card.name);
        if (a) {
            this.doStandardEffects(this.mcard);
            a.call(this, this.game, this.mcard, this.callback);
        } else {
            this.doStandardEffects(this.mcard, this.callback);
        }
    }

    /**
     * Promote a specific pillar.
     */
    promotePillar(index: number, isDemote:boolean) {

        // Modify game state
        this.game.gameState.promote(index, isDemote);

        const pd = isDemote ? 'demote' : 'promote';

        const numeral = PillarsConstants.NUMERALS[index];
        this.game.broadcast(`${this.game.gameState.currentPlayer.name} ${pd}d pillar ${numeral}`);
        this.game.playSound(PillarsSounds.PROMOTE);
    }

    /**
     * Do the regular effects like adding resources and drawing cards.
     * 
     * Returns false if we should cancel
     */
    doStandardEffects(mcard: MouseableCard, standardCallback?: Function) {

        const player = this.game.localPlayer;
        let delegatedCallback = false;
        const card = mcard.card;

        if (card.action) {

            // Retire
            if (card.action.Retire) {
                retireCardFromHand(this.game, mcard);
            }

            // Promote
            if (card.action.Promote !== undefined) {

                // 0-4 means that pillar
                if (card.action.Promote < 5) {
                    this.promotePillar(card.action.Promote, true);
                }

                // 5 means any
                if (card.action.Promote == 5) {
                    promoteAny(this.game, standardCallback);
                    if (standardCallback) {
                        delegatedCallback = true;
                    }
                }

                // 6 means roll a d6 (6 means any)
                if (card.action.Promote == 6) {
                    // Roll a d6
                    promote(this.game, standardCallback);
                    if (standardCallback) {
                        delegatedCallback = true;
                    }
                }
            }

            // Draw
            if (card.action.Draw) {
                for (let i = 0; i < card.action.Draw; i++) {
                    this.game.gameState.drawOne(player);
                    this.game.broadcast(`${player.name} drew a card`);
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
                            this.game.broadcast(`${player.name} drew a card`);
                        }
                    }
                }
            }
        }

        // Provides resources or customers
        if (card.provides) {
            if (card.provides.Talent) {
                player.numTalents += card.provides.Talent;
                const s = card.provides.Talent > 1 ? 's' : '';
                this.game.broadcast(`${player.name} added ${card.provides.Talent} Talent${s}`);
                this.game.animateTalent(mcard.x, mcard.y, card.provides.Talent);
            }
            if (card.provides.Credit) {
                player.numCredits += card.provides.Credit;
                const s = card.provides.Credit > 1 ? 's' : '';
                this.game.broadcast(`${player.name} added ${card.provides.Credit} Credit${s}`);
                this.game.animateCredits(mcard.x, mcard.y, card.provides.Credit);
            }
            if (card.provides.Creativity) {
                this.game.broadcast(
                    `${player.name} added ${card.provides.Creativity} Creativity`);
                player.numCreativity += card.provides.Creativity;
                this.game.animateCreativity(mcard.x, mcard.y, card.provides.Creativity);
            }

            if (card.provides.Customer) {
                const s = card.provides.Customer > 1 ? 's' : '';
                this.game.broadcast(`${player.name} added ${card.provides.Customer} Customer${s}`);
                player.numCustomers += card.provides.Customer;
                this.game.playSound(PillarsSounds.CUSTOMER);
                this.game.animateCustomer(mcard.x, mcard.y, card.provides.Customer);
            }

            if (card.provides.TalentByPillar !== undefined) {
                const n = player.pillarRanks[card.provides.TalentByPillar];
                player.numTalents += n;
                const s = n > 1 ? 's' : '';
                this.game.broadcast(`${player.name} added ${n} Talent${s}`);
                this.game.animateTalent(mcard.x, mcard.y, n);
            }
            if (card.provides.CreditByPillar !== undefined) {
                const n = player.pillarRanks[card.provides.CreditByPillar]
                player.numCredits += n;
                const s = n > 1 ? 's' : '';
                this.game.broadcast(`${player.name} added ${n} Credit${s}`);
                this.game.animateCredits(mcard.x, mcard.y, n);
            }
            if (card.provides.CreativityByPillar !== undefined) {
                const n = player.pillarRanks[card.provides.CreativityByPillar];
                player.numCreativity += n;
                this.game.broadcast(`${player.name} added ${n} Creativity`);
                this.game.animateCreativity(mcard.x, mcard.y, n);
            }
        }

        // Check to see if we need to call the callback now
        if (standardCallback && !delegatedCallback) {
            standardCallback();
        }

    }


}
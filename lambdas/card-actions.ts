import { Card } from './card';
import { GameState } from './game-state';
import { PillarsSounds } from './sounds';

/**
 * Standard card actions interface.
 * 
 * Implemented for the UI and for the server.
 */
export interface IStandardActions {
    retireCardFromHand: Function;
    promote: Function;
    promoteAny: Function;
}

/**
 * MouseableCard on the front end.
 */
export interface ICardContainer {
    card: Card;
}

/**
 * This is the signature for a custom card effect.
 * 
 * mcard is the card being played, which generally ends up being different 
 * than the card that gets affected. Be careful with differentiating them, 
 * e.g. mcard is not cardToRetire or cardToDiscard.
 */
export type CustomEffect = (
    game: IGame,
    mcard: ICardContainer,
    callback: Function, 
    winner?: boolean) => any;

/**
 * Custom card actions interface.
 * 
 * Implemented for the UI and for the server.
 */
export interface ICustomActions {
    get(key:string): CustomEffect;
}

/**
 * Basic representation of the game.
 * 
 * IPillarsGame has all the UI functions in it. This interface represents
 * what we can share on the front and back end.
 */
export interface IGame {
    gameState: GameState;
    broadcast(message:string):Promise<any>;
    chat(message:string):Promise<any>;

    // We'll need websockets to send the below signals out while
    // AI is taking a turn and we want to animate or play a sound.

    /**
     * Animate talent addition.
     */
    animateTalent(mcard:ICardContainer, n:number):Promise<any>;

    /**
     * Animate creativity addition.
     */
    animateCreativity(mcard:ICardContainer, n:number):Promise<any>;

    /**
     * Animate credit addition.
     */
    animateCredits(mcard:ICardContainer, n:number):Promise<any>;

    /**
     * Animate customer addition.
     */
    animateCustomer(mcard:ICardContainer, n:number):Promise<any>;

    /**
     * Play a sound.
     */
    playSound(fileName:string):Promise<any>;

    /**
     * End the turn.
     */
    endTurn(): Promise<any>;
}


/**
 * Custom card action logic is handled here.
 * 
 * See the actions folder for card-specific custom actions.
 */
export class CardActions {

    /**
     * The callback is called when we are done with all actions.
     */
    constructor(
        public game: IGame,
        private customActions: ICustomActions, 
        private standardActions: IStandardActions) {
    }

    /**
     * Do success or fail actions.
     */
    async endTrial(winner: boolean, mcard: ICardContainer, callback: Function) {

        const a = this.customActions.get(mcard.card.name);
        if (a) {
            await this.doTrialEffects(winner, mcard);
            await a.call(this, this.game, mcard, callback, winner);
        } else {
            await this.doTrialEffects(winner, mcard, callback);
        }

    }

    /**
     * Do the standard trial effects.
     */
    async doTrialEffects(winner:boolean, mcard:ICardContainer, trialCallback?:Function) {

        const player = this.game.gameState.currentPlayer;
        const card = mcard.card;
        let delegatedCallback = false;

        if (winner) {
            if (card.success) {
                if (card.success.customers !== undefined) {
                    const n = card.success.customers
                    player.numCustomers += n;
                    await this.game.playSound(PillarsSounds.CUSTOMER);
                    const s = n > 1 ? 's' : '';
                    await this.game.broadcast(`${player.name} won ${n} customer${s}`);
                }
                if (card.success.promote !== undefined) {
                    if (card.success.promote == 6) {
                        await this.standardActions.promote(this.game, trialCallback);
                        delegatedCallback = true;
                    }
                    if (card.success.promote < 5) {
                        await this.promotePillar(card.success.promote, false);
                    }
                    if (card.success.promote == 5) {
                        await this.standardActions.promoteAny(this.game, trialCallback);
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
                        await this.game.broadcast(`${player.name} lost ${n} customer${s}.`);
                    } else {
                        await this.game.broadcast(`${player.name} is already at zero customers.`);
                    }
                }
                if (card.fail.demote !== undefined) {
                    if (card.fail.demote < 5) {
                        await this.standardActions.promote(this.game, trialCallback, true);
                        delegatedCallback = true;
                    }
                    if (card.fail.demote == 5) {
                        await this.promotePillar(card.fail.demote, true);
                    }
                    if (card.fail.demote == 6) {
                        await this.standardActions.promoteAny(this.game, trialCallback, true);
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
    async play(mcard: ICardContainer, callback: Function) {
        // Some cards need special handling for custom conditions
        const a = this.customActions.get(mcard.card.name);
        if (a) {
            await this.doStandardEffects(mcard);
            await a.call(this, this.game, mcard, callback);
        } else {
            await this.doStandardEffects(mcard, callback);
        }
    }

    /**
     * Promote a specific pillar.
     */
    async promotePillar(index: number, isDemote:boolean) {

        // Modify game state
        const didSomething = this.game.gameState.promote(index, isDemote);

        const pd = isDemote ? 'demote' : 'promote';

        const NUMERALS = ['I', 'II', 'III', 'IV', 'V'];

        const numeral = NUMERALS[index];
        if (didSomething) {
            await this.game.broadcast(
                `${this.game.gameState.currentPlayer.name} ${pd}d pillar ${numeral}`);
            await this.game.playSound(PillarsSounds.PROMOTE);
        } else {
            await this.game.broadcast(
                `${this.game.gameState.currentPlayer.name} could not ${pd} pillar ${numeral}`);
        }
    }

    /**
     * Do the regular effects like adding resources and drawing cards.
     * 
     * Returns false if we should cancel
     */
    async doStandardEffects(mcard: ICardContainer, standardCallback?: Function) {

        const player = this.game.gameState.currentPlayer;
        let delegatedCallback = false;
        const card = mcard.card;

        if (card.action) {

            // Retire
            if (card.action.Retire) {
                this.standardActions.retireCardFromHand(this.game, mcard);
            }

            // Promote
            if (card.action.Promote !== undefined) {

                // 0-4 means that pillar
                if (card.action.Promote < 5) {
                    await this.promotePillar(card.action.Promote, false);
                }

                // 5 means any
                if (card.action.Promote == 5) {
                    await this.standardActions.promoteAny(this.game, standardCallback);
                    if (standardCallback) {
                        delegatedCallback = true;
                    }
                }

                // 6 means roll a d6 (6 means any)
                if (card.action.Promote == 6) {
                    // Roll a d6
                    await this.standardActions.promote(this.game, standardCallback);
                    if (standardCallback) {
                        delegatedCallback = true;
                    }
                }
            }

            // Draw
            if (card.action.Draw) {
                for (let i = 0; i < card.action.Draw; i++) {
                    this.game.gameState.drawOne(player);
                    await this.game.broadcast(`${player.name} drew a card`);
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
                            await this.game.broadcast(`${player.name} drew a card`);
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
                await this.game.broadcast(
                    `${player.name} added ${card.provides.Talent} Talent${s}`);
                await this.game.animateTalent(mcard, card.provides.Talent);
            }
            if (card.provides.Credit) {
                player.numCredits += card.provides.Credit;
                const s = card.provides.Credit > 1 ? 's' : '';
                await this.game.broadcast(
                    `${player.name} added ${card.provides.Credit} Credit${s}`);
                await this.game.animateCredits(mcard, card.provides.Credit);
            }
            if (card.provides.Creativity) {
                await this.game.broadcast(
                    `${player.name} added ${card.provides.Creativity} Creativity`);
                player.numCreativity += card.provides.Creativity;
                await this.game.animateCreativity(mcard, card.provides.Creativity);
            }

            if (card.provides.Customer) {
                const s = card.provides.Customer > 1 ? 's' : '';
                this.game.broadcast(`${player.name} added ${card.provides.Customer} Customer${s}`);
                player.numCustomers += card.provides.Customer;
                await this.game.playSound(PillarsSounds.CUSTOMER);
                await this.game.animateCustomer(mcard, card.provides.Customer);
            }

            if (card.provides.TalentByPillar !== undefined) {
                const n = player.pillarRanks[card.provides.TalentByPillar];
                player.numTalents += n;
                const s = n > 1 ? 's' : '';
                await this.game.broadcast(`${player.name} added ${n} Talent${s}`);
                await this.game.animateTalent(mcard, n);
            }
            if (card.provides.CreditByPillar !== undefined) {
                const n = player.pillarRanks[card.provides.CreditByPillar]
                player.numCredits += n;
                const s = n > 1 ? 's' : '';
                await this.game.broadcast(`${player.name} added ${n} Credit${s}`);
                await this.game.animateCredits(mcard, n);
            }
            if (card.provides.CreativityByPillar !== undefined) {
                const n = player.pillarRanks[card.provides.CreativityByPillar];
                player.numCreativity += n;
                await this.game.broadcast(`${player.name} added ${n} Creativity`);
                await this.game.animateCreativity(mcard, n);
            }
        }

        // Check to see if we need to call the callback now
        if (standardCallback && !delegatedCallback) {
            standardCallback();
        }

    }


}
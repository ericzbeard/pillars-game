import { IGame } from "../../lambdas/interfaces/game";
import { ICardContainer } from "../../lambdas/interfaces/card-container";
import { IPillarsGame } from "../interfaces/pillars-game";
import { MouseableCard } from "../ui-utils/mouseable-card";

/**
 * Talent Shortage
 * 
 * Fail: Draw 1 less card at the end of this turn.
 */
export const talentShortage = (g:IGame, 
    m: ICardContainer, 
    callback:(drawNum?:number) => any, 
    winner?: boolean) => {

    const game = g as IPillarsGame;
    const mcard = m as MouseableCard;
    
    if (winner) {
        if (callback) callback();
        return;
    }

    const modal = game.showModal('You draw one less card at the end of this turn');
    modal.hideCloseButton();

    setTimeout(() => {
        if (callback) callback(5);
    }, 2000);

}
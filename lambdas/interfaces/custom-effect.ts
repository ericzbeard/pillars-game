import { IGame } from "./game";
import { ICardContainer } from "./card-container";

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
    callback: () => any, 
    winner?: boolean) => any;

import { Mouseable } from "./mouseable";
import { Card } from "../../lambdas/card";
import { PillarsConstants } from "../constants";
import { ICardContainer } from "../../lambdas/interfaces/card-container";

/**
 * A card.
 */
export class MouseableCard extends Mouseable implements ICardContainer {

    card: Card;

    constructor(card: Card) {
        super();
        this.card = card;
        this.w = PillarsConstants.CARD_WIDTH;
        this.h = PillarsConstants.CARD_HEIGHT;
    }

    /**
     * Get the key for the info clickable.
     */
    getInfoKey(): string {
        return this.key + ' - ' + PillarsConstants.INFO_KEY;
    }
}

/**
 * Represents the current state of a game.
 */
export class GameState {

    /**
     * Id
     */
    id:string;

    /**
     * Name
     */
    name:string;

    /**
     * Public/Private
     */
    isPublic: boolean;

    /**
     * Waiting/In progress/Done
     */
    status: string;

    /**
     * Share URL
     */
    shareURL: string; // function?

    /**
     * Players (sign up or new each time?)
        	Id
        	Name/Handle
            Hand
        •	Discard Pile
        •	In play
        •	Score (customers)
        •	Pillar ranks (I-V)
        •	Total score (end game bonuses)
        •	Last dice roll
     */
    players: any[]; // TODO

    /**
     * Pillar max (4, 5, or 6)
     */
    pillarMax: number;

    /**
     * Date time started
     */
    startDateTime: string;

    /**
     * Market stack
     */
    marketStack: any[]; // TODO

    /**
     * Retired Cards
     */
    retiredCards: any[]; // TODO

    /**
     * Trial Stacks
        •	Phase
        •	Face up/down
        •	Top card showing/hidden
     */
    trialStacks: any[]; // TODO

}

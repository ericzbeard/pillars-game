
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
import { CustomEffect } from './custom-effect';

/**
 * Custom card actions interface.
 * 
 * Implemented for the UI and for the server.
 */
export interface ICustomActions {
    get(key:string): CustomEffect;
}

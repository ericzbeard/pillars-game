import { PillarsAPIConfig } from '../pillars-api-config';
import { ApiEndpoint } from './api-endpoint';
import * as uuid from 'uuid';
import { GameState, SerializedGameState } from '../game-state';
import { Database } from '../database';

/**
 * REST API functions for the /chat path
 */
export class ChatEndpoint extends ApiEndpoint {

    constructor(private database:Database) {
        super();
        this.verbs.set('put', this.put);
        this.verbs.set('get', this.get);
    }

    /**
     * Put a new chat message.
     * 
     * data is a string
     * 
     * params should be { gameId: '' }
     */
    async put(params: any, data: string): Promise<boolean> {

        await this.database.chatAdd(params.gameId, data);
        
        return true;
    }

    /**
     * Get the last 20 chat messages
     * 
     * params should be { gameId: '' }
     */
    async get(params: any, data: string): Promise<Array<string>> {

        return await this.database.chatGet(params.gameId);
        
    }


}
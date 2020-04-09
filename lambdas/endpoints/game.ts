import { PillarsAPIConfig } from '../pillars-api-config';
import { ApiEndpoint } from './api-endpoint';
import * as uuid from 'uuid';
import { GameState, SerializedGameState } from '../game-state';
import { Database } from '../database';
import { RPC } from '../rpc';

/**
 * REST API functions for the /game path
 */
export class GameEndpoint extends ApiEndpoint {

    constructor(private database:Database, private rpc:RPC) {
        super();
        this.verbs.set('put', this.put);
        this.verbs.set('get', this.get);
        this.verbs.set('post', this.post);
    }

    /**
     * Create a new game.
     * 
     * data is a stringified SerializedGameState
     */
    async put(params: any, data: string): Promise<SerializedGameState> {

        let s = <SerializedGameState>JSON.parse(data);
        
        if (s.id) {
            throw Error("Game State id should be undefined when creating a new game");
        }

        // Generate a unique ID
        s.id = uuid.v4();

        await this.database.gameCreate(s);
        
        // TODO - Start the server AI
        
        // Return the updated game state
        return s;
    }

    /**
     * Get the state of a game.
     */
    async get(params: any, data: string): Promise<SerializedGameState> {
        
        console.log('game get ' + params.id);
        
        return await this.database.gameGet(params.id);
    }

    /**
     * Delete a game.
     */
    async del(params: any, data: string) { }

    /**
     * Update game state.
     */
    async post(params: any, data: string) { 

        let newGameState = <SerializedGameState>JSON.parse(data);
        
        console.log(`game.post newGameState.version: ${newGameState.version}`);

        let oldGameState = await this.database.gameGet(newGameState.id);
        let oldVersion = oldGameState.version;
        
        console.log(`game.post oldVersion ${oldVersion}`);
        
        if (newGameState.version < oldVersion) {
            // This game state update is stale, ignore it
            console.log(`game.post got old version ${newGameState.version} ` + 
                `but stored version is ${oldVersion}`);
            return oldVersion;
        }
        
        if (newGameState.version > oldVersion) {
            // This should not be possible, since clients never change the version
            console.log(`game.post got higher version ${newGameState.version} ` + 
                `but stored version is ${oldVersion}`);
            // TODO - 400?
            return oldVersion;
        }
        
        newGameState.version += 1;

        // Update the game state
        await this.database.gameUpdate(newGameState);
        
        // If it is now the AI player's turn, start the AI handler
        if (oldGameState.currentPlayer != newGameState.currentPlayer) {
            
            if (!newGameState.players[newGameState.currentPlayer].isHuman) {
                
                // It's a new player's turn and the player is AI
                console.log(`game.post new player ${newGameState.currentPlayer} is AI`);
                
                this.rpc.aiTurn(newGameState.id);
            
            }     
        
        }
        
        return newGameState.version;
    }

}
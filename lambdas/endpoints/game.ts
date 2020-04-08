import * as AWS from 'aws-sdk';
import { PillarsAPIConfig } from '../pillars-api-config';
import { ApiEndpoint } from './api-endpoint';
import * as uuid from 'uuid';
import { GameState, SerializedGameState } from '../game-state';

AWS.config.update({region:PillarsAPIConfig.Region});

/**
 * REST API functions for the /game path
 */
export class GameEndpoint extends ApiEndpoint {

    constructor(private documentClient:AWS.DynamoDB.DocumentClient) {
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

        const item = {
            TableName: <string>process.env.GAME_TABLE,
            Item: s
        };

        const result = await this.documentClient.put(item).promise();
        
        // Return the updated game state
        return s;
    }

    /**
     * Get the state of a game.
     */
    async get(params: any, data: string): Promise<SerializedGameState> {
        
        const item = {
            TableName: <string>process.env.GAME_TABLE,
            Key: {
                'id': params.id
            }
        };

        const result = await this.documentClient.get(item).promise();
        
        return <SerializedGameState>result.Item;
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

        // First get the current game state and check the version
        const getItem = {
            TableName: <string>process.env.GAME_TABLE,
            Key: {
                'id': newGameState.id
            }
        };
        let result = await this.documentClient.get(getItem).promise();
        
        let currentGameState = <SerializedGameState>result.Item;
        let currentVersion = currentGameState.version;
        
        console.log(`game.post currentVersion ${currentVersion}`);
        
        if (newGameState.version < currentVersion) {
            // This game state update is stale, ignore it
            console.log(`game.post got old version ${newGameState.version} ` + 
                `but stored version is ${currentVersion}`);
            return currentVersion;
        }
        
        if (newGameState.version > currentVersion) {
            // This should not be possible, since clients never change the version
            console.log(`game.post got higher version ${newGameState.version} ` + 
                `but stored version is ${currentVersion}`);
            // TODO - 400?
            return currentVersion;
        }
        
        newGameState.version += 1;

        // Update the game state
        const postItem = {
            TableName: <string>process.env.GAME_TABLE,
            Item: newGameState
        };
        result = await this.documentClient.put(postItem).promise();
        
        return newGameState.version;
    }

}
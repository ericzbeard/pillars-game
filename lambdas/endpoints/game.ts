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

        console.log(`put data: ${data}`);

        let s = <SerializedGameState>JSON.parse(data);

        // Generate a unique ID
        s.id = uuid.v4();

        const item = {
            TableName: <string>process.env.GAME_TABLE,
            Item: s
        };

        const result = await this.documentClient.put(item).promise();
        
        console.log(`put result: ${JSON.stringify(result, null, 0)}`);
        
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
        
        console.log(`get result: ${JSON.stringify(result, null, 0)}`);

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

        console.log(`post data: ${data}`);

        let s = <SerializedGameState>JSON.parse(data);

        const item = {
            TableName: <string>process.env.GAME_TABLE,
            Item: s
        };

        const result = await this.documentClient.put(item).promise();
        
        console.log(`post result: ${JSON.stringify(result, null, 0)}`);
        
        return true;
    }

}
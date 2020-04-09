import * as AWS from 'aws-sdk';
import * as uuid from 'uuid';
import { GameState, SerializedGameState } from './game-state';
import { PillarsAPIConfig } from './pillars-api-config';


/**
 * Abstract database access functions away from the lambda handlers.
 * 
 * This file should not have much in the way of logic. Just db access.
 */
export class Database {
    
    constructor(
        private documentClient:AWS.DynamoDB.DocumentClient, 
        private dynamo: AWS.DynamoDB) {
    
    }
    
    /**
     * Create a new pillars game.
     */
    async gameCreate(s:SerializedGameState): Promise<boolean> {
        
        const item = {
            TableName: <string>process.env.GAME_TABLE,
            Item: s
        };

        const result = await this.documentClient.put(item).promise();
        
        return true;
    }
   
    /**
     * Update and existing game.
     */
    async gameUpdate(newGameState:SerializedGameState): Promise<boolean> {
       
        const postItem = {
            TableName: <string>process.env.GAME_TABLE,
            Item: newGameState
        };
        const result = await this.documentClient.put(postItem).promise();
        
        return true;
    }
    
      
    timeout(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
   
    /**
     * Get an existing game.
     */
    async gameGet(id:string): Promise<SerializedGameState> {
        
        console.log(`gameGet id: ${id}`)
       
        const item = {
            TableName: <string>process.env.GAME_TABLE,
            Key: {
                'id': id
            }, 
            ConsistentRead: true 
        };
        
        const result = await this.documentClient.get(item).promise();
        
        return <SerializedGameState>result.Item;
    }
    
    /**
     * Add a new chat message.
     */
    async chatAdd(gameId:string, data:string) :Promise<boolean> {
        
        // Generate a unique ID
        const isoDate = new Date().toISOString();
        
        const item = {
            TableName: <string>process.env.CHAT_TABLE,
            Item: {
                id: gameId,
                time_id: `${isoDate}_${uuid.v4()}`,
                message: data
            }
        };

        await this.documentClient.put(item).promise();

        return true;
    }
    
    /**
     * Get the last 20 chat messages.
     */
    async chatGet(id:string): Promise<Array<string>> {
        
        const q: AWS.DynamoDB.QueryInput = {
            ExpressionAttributeValues: {
                ":gid": {
                    S: id
                }
            },
            KeyConditionExpression: "id = :gid",
            ProjectionExpression: "message",
            TableName: <string>process.env.CHAT_TABLE,
            Limit: 20,
            ScanIndexForward: false, 
            ConsistentRead: true
        };

        const result = await this.dynamo.query(q).promise();

        const retval = new Array<string>();

        if (result.Items) {
            for (const m of result.Items) {
                retval.unshift(<string>m.message.S);
            }
        }

        return retval;
        
    }
    
}
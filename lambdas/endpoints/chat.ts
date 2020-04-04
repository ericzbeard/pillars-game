import * as AWS from 'aws-sdk';
import { PillarsAPIConfig } from '../pillars-api-config';
import { ApiEndpoint } from './api-endpoint';
import * as uuid from 'uuid';
import { GameState, SerializedGameState } from '../game-state';

AWS.config.update({ region: PillarsAPIConfig.Region });

/**
 * REST API functions for the /chat path
 */
export class ChatEndpoint extends ApiEndpoint {

    constructor(private documentClient: AWS.DynamoDB.DocumentClient,
        private client: AWS.DynamoDB) {
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

        console.log(`put data: ${data}`);

        // Generate a unique ID
        const id = uuid.v4();
        const isoDate = new Date().toISOString();

        const item = {
            TableName: <string>process.env.CHAT_TABLE,
            Item: {
                id: params.gameId,
                time_id: `${isoDate}_${uuid.v4()}`,
                message: data
            }
        };

        const result = await this.documentClient.put(item).promise();

        console.log(`put result: ${JSON.stringify(result, null, 0)}`);

        return true;
    }

    /**
     * Get the last 20 chat messages
     * 
     * params should be { gameId: '' }
     */
    async get(params: any, data: string): Promise<Array<string>> {

        const q: AWS.DynamoDB.QueryInput = {
            ExpressionAttributeValues: {
                ":gid": {
                    S: params.gameId
                }
            },
            KeyConditionExpression: "id = :gid",
            ProjectionExpression: "message",
            TableName: <string>process.env.CHAT_TABLE,
            Limit: 20,
            ScanIndexForward: false
        };

        const result = await this.client.query(q).promise();

        console.log(`get result: ${JSON.stringify(result, null, 0)}`);

        const retval = new Array<string>();

        if (result.Items) {
            for (const m of result.Items) {
                retval.unshift(<string>m.message.S);
            }
        }

        return retval;
    }

    /**
     * 
     */
    async del(params: any, data: string) { }

    /**
     * 
     */
    async post(params: any, data: string) { }

}
import * as queryString from 'query-string';
import * as AWS from 'aws-sdk';
import { PillarsAPIConfig } from './pillars-api-config';
import { ApiEndpoint } from './endpoints/api-endpoint';
import { GameEndpoint } from './endpoints/game';
import { ChatEndpoint } from './endpoints/chat';
import { Lambda } from 'aws-sdk';
import { APIGatewayEvent } from 'aws-lambda';

AWS.config.update({region:PillarsAPIConfig.Region});

const documentClient = new AWS.DynamoDB.DocumentClient();
const dynamo = new AWS.DynamoDB();

/**
 * Lambda  handler for server ai.
 * 
 * This function is responsible for monitoring game state and taking turns.
 */
export const handler = async (event: APIGatewayEvent): Promise<any> => { 
    try {

        console.log(`server-ai-handler invoked with event: ${JSON.stringify(event, null, 0)}}`);
      

    } catch (ex) {

        console.error(ex);
     
    }
};
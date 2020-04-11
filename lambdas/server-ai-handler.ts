import * as AWS from 'aws-sdk';
import { PillarsAPIConfig } from './pillars-api-config';
import { Database } from './database';
import { GameState, SerializedGameState } from './game-state';
import { ServerAi } from './server-ai';
import { ServerGame } from './server-game';

AWS.config.update({region:PillarsAPIConfig.Region});

const documentClient = new AWS.DynamoDB.DocumentClient();
const dynamo = new AWS.DynamoDB();
const database = new Database(documentClient, dynamo);

/**
 * Lambda  handler for server ai.
 * 
 * This function is responsible for taking an AI turn.
 * 
 * This function is not wired up with API Gateway. 
 * It is called with an async invoke from rpc.ts, called by game.ts.
 */
export const handler = async (event: any): Promise<any> => { 
    try {

        console.log(`server-ai-handler invoked with event: ${JSON.stringify(event, null, 0)}`);
      
        const id = event.id;
        const sgs = await database.gameGet(id);
        const gameState = GameState.RehydrateGameState(sgs);
        const game = new ServerGame(gameState, database);
        const ai = new ServerAi(game);
        await ai.takeTurn();

    } catch (ex) {
        console.error(ex);
    }
};
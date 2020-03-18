import { GameState, SerializedGameState } from './game-state';
import * as queryString from 'query-string';
import * as uuid from 'uuid';
import * as AWS from 'aws-sdk';
import { PillarsAPIConfig } from '../config/pillars-api-config';
AWS.config.update({region:PillarsAPIConfig.Region});

/**
 * A base class for REST API endpoints.
 */
class ApiEndpoint {

    /**
     * Lower case HTTP verbs like get, put, etc.
     */
    verbs: Map<string, Function>;

    constructor() {
        this.verbs = new Map<string, Function>();
    }

}

/**
 * REST API functions for the /game path
 */
class GameEndpoint extends ApiEndpoint {

    constructor() {
        super();
        this.verbs.set('put', this.put);
    }

    /**
     * Create a new game.
     * 
     * data is a stringified SerializedGameState
     */
    async put(params: any, data: string): Promise<GameState> {

        let s = <SerializedGameState>JSON.parse(data);

        // Generate a unique ID
        s.id = uuid.v4();

        const item = {
            TableName: <string>process.env.GAME_TABLE,
            Item: s
        };

        const documentClient = new AWS.DynamoDB.DocumentClient();

        const result = await documentClient.put(item).promise();
        
        console.log(`put result: ${JSON.stringify(result, null, 0)}`);
        
        const gameState = GameState.RehydrateGameState(s);

        // Return the updated game state
        return gameState;
    }

    /**
     * Get the state of a game.
     */
    get(params: any, data: string): GameState {
        return new GameState();
    }

    /**
     * Delete a game.
     */
    del(params: any, data: string) { }

    /**
     * Update game state.
     */
    post(params: any, data: string) { }

}

/**
 * This exists to enable local unit testing.
 */
class UnitTestEndpoint extends ApiEndpoint {

    constructor() {
        super();
        this.verbs.set('get', this.get);
    }

    get(params: any, data: string) {
        return { result: "Ok" }
    }

}

/**
 * This class handles mapping between paths and imlementation functions.
 */
export class ApiHandler {

    endpoints: Map<string, ApiEndpoint>;

    constructor() {
        this.endpoints = new Map<string, ApiEndpoint>();
        this.endpoints.set('game', new GameEndpoint());
        this.endpoints.set('unittest', new UnitTestEndpoint());
    }

    /**
     * Parse the path and call the appropriate endpoint.
     */
    handlePath = async (path: string, verb: string, data: string): Promise<any> => {

        console.log(`handlePath got path ${path}, verb ${verb}`);

        if (path.startsWith('/')) {
            path = path.substr(1, path.length - 1);

            console.log(`Stripped / from path: ${path}`);
        }

        let parsed = queryString.parseUrl(path);
        let params = parsed.query;

        console.log(this.endpoints.keys());

        // e.g.
        // GET /game?gameId=x
        // PUT /game

        // Iterate over endpoints and look for a matching key
        for (const [key, value] of this.endpoints.entries()) {

            console.log(`Testing path ${path} with key ${key}`);

            const r = new RegExp(`^${key}\$`);

            if (r.test(path)) {

                console.log(`Path ${path} matches`);

                const endpoint = value;
                if (endpoint) {
                    const f = endpoint.verbs.get(verb.toLowerCase());
                    if (f) {

                        // Call the endpoint function
                        const retval = f(params, data);

                        console.log(`${path}.${verb} retval: ${retval}`);

                        return retval;
                    } else {
                        throw Error(`${key} has no ${verb} function`);
                    }
                } else {
                    throw Error('endpoint is null ??');
                }
            }
        }

        throw Error('Unexpected path');
    };

}

/**
 * Lambda proxy handler. This handles all requests.
 */
export const handler = async (event: any): Promise<any> => { // APIGatewayEvent
    try {

        const h: ApiHandler = new ApiHandler();

        const resp = await h.handlePath(event.path, event.httpMethod, event.body ?? '');

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resp)
        };

    } catch (ex) {

        console.error(ex);

        return {
            statusCode: 500,
            headers: { 'Content-Type': 'text/plain' },
            body: `Request Failed\n`
        };
    }
};
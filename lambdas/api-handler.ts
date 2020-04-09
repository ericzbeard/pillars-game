import * as queryString from 'query-string';
import * as AWS from 'aws-sdk';
import { PillarsAPIConfig } from './pillars-api-config';
import { ApiEndpoint } from './endpoints/api-endpoint';
import { GameEndpoint } from './endpoints/game';
import { ChatEndpoint } from './endpoints/chat';
import { Lambda } from 'aws-sdk';
import { APIGatewayEvent } from 'aws-lambda';
import { Database } from './database';
import { RPC } from './rpc';

AWS.config.update({region:PillarsAPIConfig.Region});

const documentClient = new AWS.DynamoDB.DocumentClient();
const dynamo = new AWS.DynamoDB();
const lambda = new AWS.Lambda();

const database = new Database(documentClient, dynamo);
const rpc = new RPC(lambda);

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
 * 
 * TODO - Should probably just use Express...
 */
export class ApiHandler {

    endpoints: Map<string, ApiEndpoint>;

    constructor() {
        this.endpoints = new Map<string, ApiEndpoint>();
        this.endpoints.set('game', new GameEndpoint(database, rpc));
        this.endpoints.set('chat', new ChatEndpoint(database));
        this.endpoints.set('unittest', new UnitTestEndpoint());
    }

    /**
     * Parse the path and call the appropriate endpoint.
     */
    handlePath = async (path: string, verb: string, params?:any, data?: string): Promise<any> => {

        if (path.startsWith('/')) {
            path = path.substr(1, path.length - 1);
        }

        let parsed = queryString.parseUrl(path);
        if (!params) {
            params = parsed.query;
        }
        path = parsed.url;

        // e.g.
        // GET /game?gameId=x
        // PUT /game

        // Iterate over endpoints and look for a matching key
        for (const [key, value] of this.endpoints.entries()) {

            const r = new RegExp(`^${key}\$`);

            if (r.test(path)) {

                const endpoint = value;
                if (endpoint) {
                    const f = endpoint.verbs.get(verb.toLowerCase());
                    if (f) {

                        // Call the endpoint function
                        try {
                            const retval = await f.call(endpoint, params, data);

                            return retval;
                        } catch (apiError) {
                            console.error(apiError);
                            throw Error(`API call ${path} failed`);
                        }
                    } else {
                        throw Error(`${key} has no ${verb} function`);
                    }
                } else {
                    throw Error('endpoint is null ??');
                }
            }
        }

        throw Error('Unexpected path: ' + path);
    };

}

/**
 * Lambda proxy handler. This handles all requests.
 */
export const handler = async (event: APIGatewayEvent): Promise<any> => { // APIGatewayEvent
    try {

        const h: ApiHandler = new ApiHandler();

        const resp = await h.handlePath(event.path, event.httpMethod,
            event.queryStringParameters, event.body || undefined);

        return {
            statusCode: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Headers': 'Authorization,Content-Type,X-Amz-Date,X-Amz-Security-Token,X-Api-Key',
                'Access-Control-Allow-Origin': '*', 
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify(resp)
        };

    } catch (ex) {

        console.error(ex);

        // TODO - 400 errors

        return {
            statusCode: 500,
            headers: { 
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Headers': 'Authorization,Content-Type,X-Amz-Date,X-Amz-Security-Token,X-Api-Key',
                'Access-Control-Allow-Origin': '*', 
                "Access-Control-Allow-Credentials": true 
            },
            body: `Request Failed\n`
        };
    }
};
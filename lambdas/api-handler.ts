import * as queryString from 'query-string';
import * as AWS from 'aws-sdk';
import { PillarsAPIConfig } from './pillars-api-config';
import { ApiEndpoint } from './endpoints/api-endpoint';
import { GameEndpoint } from './endpoints/game';

AWS.config.update({region:PillarsAPIConfig.Region});

const documentClient = new AWS.DynamoDB.DocumentClient();

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
        this.endpoints.set('game', new GameEndpoint(documentClient));
        this.endpoints.set('unittest', new UnitTestEndpoint());
    }

    /**
     * Parse the path and call the appropriate endpoint.
     */
    handlePath = async (path: string, verb: string, data?: string): Promise<any> => {

        console.log(`handlePath got path ${path}, verb ${verb}`);

        if (path.startsWith('/')) {
            path = path.substr(1, path.length - 1);

            console.log(`Stripped / from path: ${path}`);
        }

        let parsed = queryString.parseUrl(path);
        let params = parsed.query;
        path = parsed.url;

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
                        try {
                            const retval = await f.call(endpoint, params, data);

                            console.log(`${path}.${verb} retval: ${retval}`);

                            return retval;
                        } catch (apiError) {
                            console.log(apiError);
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
export const handler = async (event: any): Promise<any> => { // APIGatewayEvent
    try {

        const h: ApiHandler = new ApiHandler();

        console.log(`api-handler event ${JSON.stringify(event, null, 0)}`);

        const resp = await h.handlePath(event.path, event.httpMethod, event.body ?? '');

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
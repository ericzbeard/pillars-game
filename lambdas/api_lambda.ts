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
 * Represents the current state of a game.
 */
class GameState {

    /**
     * Id
     */
    id:string;

    /**
     * Name
     */
    name:string;

    /**
     * Public/Private
     */
    isPublic: boolean;

    /**
     * Waiting/In progress/Done
     */
    status: string;

    /**
     * Share URL
     */
    shareURL: string; // function?

    /**
     * Players (sign up or new each time?)
        	Id
        	Name/Handle
            Hand
        •	Discard Pile
        •	In play
        •	Score (customers)
        •	Pillar ranks (I-V)
        •	Total score (end game bonuses)
        •	Last dice roll
     */
    players: any[]; // TODO

    /**
     * Pillar max (4, 5, or 6)
     */
    pillarMax: number;

    /**
     * Date time started
     */
    startDateTime: string;

    /**
     * Market stack
     */
    marketStack: any[]; // TODO

    /**
     * Retired Cards
     */
    retiredCards: any[]; // TODO

    /**
     * Trial Stacks
        •	Phase
        •	Face up/down
        •	Top card showing/hidden
     */
    trialStacks: any[]; // TODO

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
     */
    put(name: string): GameState {
        return new GameState();
    }

    /**
     * Get the state of a game.
     */
    get(id:string):GameState {
        return new GameState();
    }

    /**
     * Delete a game.
     */
    del(id:string) { }

    /**
     * Update game state.
     */
    post(gameState:GameState) { }

}

/**
 * This exists to enable local unit testing.
 */
class UnitTestEndpoint extends ApiEndpoint {

    constructor() {
        super();
        this.verbs.set('get', this.get);
    }

    get(name:string) {
        return { result: "Ok" }
    }

}

/**
 * This class handles mapping between paths and imlementation functions.
 */
class ApiHandler {

    endpoints: Map<string, ApiEndpoint>;

    constructor() {
        this.endpoints = new Map<string, ApiEndpoint>();
        this.endpoints.set('game', new GameEndpoint());
        this.endpoints.set('unittest', new UnitTestEndpoint());
    }

    /**
     * Parse the path and call the appropriate endpoint.
     */
    handlePath = async (path: string, verb:string, data:string): Promise<any> => {

        console.log(`handlePath got path ${path}, verb ${verb}`);

        console.log(this.endpoints.keys());

        // e.g.
        // GET /game/abc
        // PUT /game

        for (const [key, value] of this.endpoints.entries()) {

            console.log(`Testing path ${path} with key ${key}`);

            const r = new RegExp(`^${key}\$`);

            if (r.test(path)) {

                console.log(`Path ${path} matches`);
                
                const endpoint = value;
                if (endpoint) {
                    const f = endpoint.verbs.get(verb.toLowerCase());
                    if (f) {
                        const retval = f(data);

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
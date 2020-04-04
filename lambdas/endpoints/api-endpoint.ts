
/**
 * A base class for REST API endpoints.
 */
export class ApiEndpoint {

    /**
     * Lower case HTTP verbs like get, put, etc.
     */
    verbs: Map<string, Function>;

    constructor() {
        this.verbs = new Map<string, Function>();
    }

}
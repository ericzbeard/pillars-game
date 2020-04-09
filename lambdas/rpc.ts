import * as AWS from 'aws-sdk';

/**
 * This class abstracts remote procedure calls such as invoking lambda functions.
 */
export class RPC {
    
    constructor(private lambda:AWS.Lambda) {
        
    }
    
    /**
     * Start an AI turn.
     */
    aiTurn(id:string) {
        // Invoke the AI lambda asynchronously
        const lambda = new AWS.Lambda();
        lambda.invokeAsync({ 
            FunctionName: <string>process.env.SERVER_AI_LAMBDA, 
            InvokeArgs: `{ id: ${id}}`
        })
    }
}
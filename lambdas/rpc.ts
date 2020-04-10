import * as AWS from 'aws-sdk';

/**
 * This class abstracts remote procedure calls from lambdas 
 * such as invoking other lambda functions.
 */
export class RPC {
    
    constructor(private lambda:AWS.Lambda) {
        
    }
    
    /**
     * Start an AI turn.
     */
    async aiTurn(id:string) {
        
        // Invoke the AI lambda asynchronously

        console.log(`rpc.aiTurn id: ${id}, function name: ${process.env.SERVER_AI_LAMBDA}`);

        const lambda = new AWS.Lambda();
        const resp = await lambda.invokeAsync({ 
            FunctionName: <string>process.env.SERVER_AI_LAMBDA, 
            InvokeArgs: `{ "id": "${id}" }`
        }).promise();

        console.log(`rpc.aiTurn resp: ${JSON.stringify(resp, null, 0)}`);
    }
}
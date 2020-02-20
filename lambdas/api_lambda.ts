/**
 * Parse the path and call the appropriate endpoint.
 */
const handlePath = async (path:string): Promise<any> => {
    console.log(`handlePath got path ${path}`);

    return {
        path: path
    };
};

/**
 * Lambda proxy handler. This handles all requests.
 */
export const handler = async (event: any): Promise<any> => {
    try {
        const resp = await handlePath(event.path);
        
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
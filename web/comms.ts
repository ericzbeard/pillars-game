import { PillarsWebConfig } from './pillars-web-config';
import { GameState, SerializedGameState } from '../lambdas/game-state';
import * as uuid from 'uuid';
const $ = require("jquery");

/**
 * Make an unauthenticated call to the REST API.
 */
export const uapi = async (endpoint:string, 
                     verb:string, 
                     data:string) => {

    const url = PillarsWebConfig.ApiUrl + endpoint;

    return new Promise((resolve, reject) => {
        $.ajax(url, {
            type: verb,
            crossDomain: true,
            contentType: "application/json; charset=UTF-8",
            data: data,
            success: (data:any) => {
                resolve(data)
            },
            error: function (xhr:any, ajaxOptions:any, thrownError:any) {
                reject(thrownError)
            }
        });
    });

}


/**
 * An ordered function queue that doesn't allow an async function to begin 
 * executing until all others before it have finished.
 */
export class Q {

    private q: Map<string, Function>;
    private order: Array<string>;
    private results: Map<string, any>;
    private errors: Map<string, any>;
    private finished: Array<string>;
    private polling: boolean;
    
    constructor() {
        this.q = new Map<string, Function>();
        this.order = new Array<string>();
        this.results = new Map<string, any>();
        this.errors = new Map<string, any>();
        this.finished = new Array<string>();
        this.polling = false;
        
        setInterval(() => {
            this.poll.call(this)
        }, 1);
    }
    
    async poll() {
        if (this.polling) return;
        try {
            this.polling = true;
            while (this.order.length > 0) {
                const id = <string>this.order.shift();
                const f = <Function>this.q.get(id);
                this.q.delete(id);
                try {
                    this.results.set(id, await f());
                } catch (fex) {
                    this.errors.set(id, fex);
                }
                this.finished.push(id);
            }
            this.polling = false;
        } catch (ex) {
            console.error(ex);
            this.polling = false;
        }
    }
    
    add(f:Function): Promise<any> {
        
        const id = uuid.v4();
        this.q.set(id, f);
        this.order.push(id);
        
        return new Promise((resolve, reject) => {
             try {
                 resolve(this.execute(id));
             } catch (ex) {
                 reject(ex);
             }
        });
    
    }
    
    timeout(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Wait for the function to execute in order and return its results.
     */
    async execute(id:string) {
        while (true) {
            if (this.finished.length > 0 && this.finished[0] == id) {
                this.finished.shift();
                const err = this.errors.get(id);
                if (err) {
                    this.errors.delete(id);
                    throw err;
                }
                const result = this.results.get(id);
                if (result) {
                    this.results.delete(id);
                    return result;
                }
            }
            await this.timeout(1);
        }
    }

}

export class Comms {
    
    private q:Q;
    
    constructor() {
        this.q = new Q();
    }
    
    /**
     * Poll for chat messages.
     * 
     * TODO - Replace with websockets
     */
    async pollForChatMessages(
        gameStateId:string, shouldPoll:Function, applyChat:Function) {
    
        setInterval(async () => {
            try {
    
                if (!shouldPoll()) {
                    return;
                }
    
                // Get the latest chat messages from the server
                const resp = await this.q.add(async () => {
                    return await uapi('chat?gameId=' + gameStateId, 'get', '');
                });
                applyChat(resp);
    
            } catch (ex) {
                console.error('Poll for chat exception: ' + ex);
            }
        }, 2000);
    }
    
    
    /**
     * Poll for game state changes.
     */
    pollForBroadcast(
        gameStateId: string, shouldPoll:Function, applyBroadcast:Function) {
    
        setInterval(async () => {
            try {
    
                if (!shouldPoll()) {
                    return;
                }
    
                // Get the latest game state from the server
                const resp = await this.q.add(async () => {
                    return await uapi('game?id=' + gameStateId, 'get', '');
                });
                applyBroadcast(resp);
    
            } catch (ex) {
                console.error('Poll for broadast exception: ' + ex);
            }
        }, 2000);
    }
    
    /**
     * Send a chat message.
     */
    async putChat(message:string, gameStateId: string) {
       
       try {
            const resp = await this.q.add(async () => {
                return await uapi('chat?gameId=' + gameStateId, 'put', message);
            });
            console.log('Put chat sucessfully: ' + resp);
        } catch (ex) {
            console.error(ex);
        }
    
    }
    
    /**
     * Broadcast a change to the game state.
     */
    async sendBroadcast(getCurrentGameState:Function, callback:Function) {
        
        // TODO - Race condition when we broadcast twice quickly, 
        // before the response comes back. Need to queue them.
    
        try {
            
            
            // This is tricky! We need to send broadcasts in order so we need 
            // to look at game state when the queue actually calls the function.
            // Otherwise, gameState.version will be the same for rapid subsequent calls.
            const callApi = async () => {
                
                // Send game state to the server and deliver it to other players
                const sgs = JSON.stringify(new SerializedGameState(getCurrentGameState()));
                
                return await uapi('game', 'post', sgs); 
            };
            
            // Put the call to uapi in the queue
            const resp = await this.q.add(async () => {
                return await callApi();
            });
            
            callback(resp);
        } catch (ex) {
            console.error(`Error posting game state: ${ex}`);
        }
    }
}    


require('dotenv').config();
import { uapi } from '../web/comms';
import { GameState, SerializedGameState } from '../lambdas/game-state';

/**
 * Pillars REST API Integration Tests.
 * 
 * Calls the deployed REST API using a configured endpoint URL.
 * 
 * You need to create a .env file to run this (See sample-dotenv)
 * 
 * @group api
 */
 

test('New game', async () => {

    const numPlayers = 2;
    const pillarMax = 4;
    const isSolo = false;
    const name = 'HumanTest';
    let id = '';
    
    const create = async () => {
        const gameState = new GameState();
        gameState.start(numPlayers, pillarMax, name, isSolo);
    
        const gs = JSON.stringify(new SerializedGameState(gameState));
    
        const data = await uapi('game', 'PUT', gs,);
        const rgs = GameState.RehydrateGameState(<SerializedGameState>data);
               
        expect(rgs.id).toBeDefined();
        
        id = rgs.id;
        
    }
    
    await create();
    
    const get = async () => {
        
        const data = await uapi('game?id=' + id, 'get', '');
        expect (data).toBeDefined();
        const gameState = GameState.RehydrateGameState(<SerializedGameState>data);
        expect(gameState.players.length).toEqual(numPlayers);
    }
    
    await get();
    
});
 
import { ApiHandler } from '../lambdas/api-handler';
import { GameState, SerializedGameState } from '../lambdas/game-state';
require('dotenv').config();

/**
 * Pillars API Integration Tests.
 * 
 * These tests run after deployment by making web requests to the API.
 * 
 * You need to create a .env file to run this (See sample-dotenv)
 * 
 * @group integration
 */

test('Create a new game ddb put', async () => {

    // We are using ApiHandler directly here, without actually calling 
    // the deployed REST API endpoint. We should test that separately.

    const h: ApiHandler = new ApiHandler();

    const gameState = new GameState();
    gameState.name = 'Integration Test Game';
    gameState.initializeCards();
    const s = new SerializedGameState(gameState);

    let resp = await h.handlePath('/game', 'put', JSON.stringify(s));

    const gameState2 = GameState.RehydrateGameState(<SerializedGameState>resp);

    expect(gameState2.name).toEqual(gameState.name);

    resp = await h.handlePath('/game?id=' + gameState2.id, 'get', undefined); 

    const gameState3 = GameState.RehydrateGameState(<SerializedGameState>resp);

    expect(gameState3.name).toEqual(gameState.name);

});

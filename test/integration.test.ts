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

    const resp = await h.handlePath('/game', 'put', JSON.stringify(s));

});

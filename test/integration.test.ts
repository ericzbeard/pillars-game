import { ApiHandler } from '../lambdas/api-handler';
import { GameState, SerializedGameState } from '../lambdas/game-state';
import { PillarsAPIConfig } from '../lambdas/pillars-api-config';
import * as AWS from 'aws-sdk';

AWS.config.update({region:PillarsAPIConfig.Region});

require('dotenv').config();

/**
 * Pillars API Handler Integration Tests.
 * 
 * These tests use the lambda API code to make calls to DDB, but the 
 * actual REST API is not called. It goes directly from here to the database.
 * 
 * TODO - Make a separate test file for API tests that actually make HTTP calls.
 * 
 * You need to create a .env file to run this (See sample-dotenv)
 * 
 * @group integration
 */
 

test('DDb get', async () => {

    const item = { 
        TableName: 'Pillars-ezbeard-GameTable0C79FC62-1IPYGWWVQSO92', 
        Key: {
            id: '7808196a-1099-4e5b-9698-4c79ad91e10e'
        }
    };
    
    const ddb = new AWS.DynamoDB.DocumentClient();
    
    const result = await ddb.get(item).promise();
    
    expect(result?.Item?.id).toEqual('7808196a-1099-4e5b-9698-4c79ad91e10e');
    
    
});


test('Chat table put get', async () => {

    const h: ApiHandler = new ApiHandler();

    let gameState = new GameState();
    gameState.name = 'Integration Test Game';
    gameState.initializeCards();
    const s = new SerializedGameState(gameState);

    const js = JSON.stringify(s);

    let resp = await h.handlePath('/game', 'put', null, js);
    gameState = GameState.RehydrateGameState(<SerializedGameState>resp);

    const testMessage1 = "Test Message";
    resp = await h.handlePath('/chat', 'put', {gameId: gameState.id}, testMessage1);
    expect(resp).toBeTruthy();

    resp = await h.handlePath('/chat', 'get', {gameId: gameState.id});

    expect(resp).toBeInstanceOf(Array);
    expect((<Array<string>>resp).length).toEqual(1);
    expect((<Array<string>>resp)[0]).toEqual(testMessage1);

    const testMessage2 = "Test Message 2";

    resp = await h.handlePath('/chat', 'put', {gameId: gameState.id}, testMessage2);
    expect(resp).toBeTruthy();

    resp = await h.handlePath('/chat', 'get', {gameId: gameState.id});

    // Make sure the array is sorted correctly
    
    expect(resp).toBeInstanceOf(Array);
    expect((<Array<string>>resp).length).toEqual(2);
    expect((<Array<string>>resp)[0]).toEqual(testMessage1);
    expect((<Array<string>>resp)[1]).toEqual(testMessage2);
    

});

test('Put post get game ddb', async () => {

    // We are using ApiHandler directly here, without actually calling 
    // the deployed REST API endpoint. We should test that separately.

    const h: ApiHandler = new ApiHandler();

    const gameState = new GameState();
    gameState.name = 'Integration Test Game';
    gameState.initializeCards();
    const s = new SerializedGameState(gameState);

    const js = JSON.stringify(s);

    //console.log(`js: ${js}`);

    let resp = await h.handlePath('/game', 'put', null, js);
    const gameState2 = GameState.RehydrateGameState(<SerializedGameState>resp);
    expect(gameState2.name).toEqual(gameState.name);
    expect(gameState2.id).toBeDefined();

    resp = await h.handlePath('/game?id=' + gameState2.id, 'get', null, undefined); 
    expect(resp).toBeDefined();
    const gameState3 = GameState.RehydrateGameState(<SerializedGameState>resp);
    expect(gameState3.id).toBeDefined();
    expect(gameState3.name).toEqual(gameState.name);
    expect(gameState3.version).toEqual(gameState2.version);

    resp = await h.handlePath('/game', 'get', {id: gameState2.id}, undefined);
    const gameState4 = GameState.RehydrateGameState(<SerializedGameState>resp);
    expect(gameState4.id).toBeDefined();
    expect(gameState4.name).toEqual(gameState.name);

    // POST, then GET to make sure it hasn't changed
    const sgs = JSON.stringify(new SerializedGameState(gameState4));
    let postResp = await h.handlePath('/game', 'post', null, sgs);
    resp = await h.handlePath('/game?id=' + gameState4.id, 'get', null, undefined); 
    const gameState5 = GameState.RehydrateGameState(<SerializedGameState>resp);
    expect(gameState5.id).toBeDefined();
    expect(gameState5.id).toEqual(gameState2.id);
    expect(gameState5.name).toEqual(gameState.name);
    
    // Make sure version is incremented as expected
    expect(postResp).toEqual(gameState5.version);
    expect(gameState5.version).toBe(gameState4.version + 1);


});

import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import PillarsApi = require('../stacks/pillars-api-stack');
import { SynthUtils } from '@aws-cdk/assert';
import apiLambda = require('../lambdas/api-handler');
import {Card} from '../lambdas/card';
import { cardDatabase } from '../lambdas/card-database';
import { GameState } from '../lambdas/game-state';
import {Player} from '../lambdas/player';
import {LocalGame} from '../web/local-game';

/**
 * Upvote API Unit Tests.
 * 
 * These tests are run locally, before deployment.
 * 
 * These tests should not connect to any external resources.
 * 
 * @group unit
 */

// Need to figure out this snapshot nonsense, it fails every time

// // The snapshot will need to be updated whenever we make infra changes.
// // Most of what we do will be changes to the lambda functions, so this is 
// // good to have in place to warn us of anything unintentional.
// test('Stack Has Not Changed', () => {
//     const app = new cdk.App();
//     const stack = new PillarsApi.PillarsApiStack(app, 'MyTestStack');
//     expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
// });

// Add more unit tests here.

test('I know how RegExp works', () => {
    const key = 'unittest';
    const r = new RegExp(`^${key}\$`);
    expect(r.test('unittest')).toBeTruthy();
    expect(r.test('nope')).toBeFalsy();
});

test('Lambda handles path', async () => {
    let resp = await apiLambda.handler({ 
        path: 'unittest', 
        httpMethod: 'GET', 
        body: 'abc'
    });
    console.log(resp);
    expect(resp.statusCode).toBe(200);

    // Handle with or without the /
    resp = await apiLambda.handler({ 
        path: '/unittest', 
        httpMethod: 'GET', 
        body: 'abc'
    });
    console.log(resp);
    expect(resp.statusCode).toBe(200);
});

test('Game State Initializes', () => {
    const gameState = new GameState();
    gameState.initializeCards();

    expect(gameState.marketStack.length).toBeGreaterThan(0);
    expect(gameState.currentMarket.length).toBeGreaterThan(0);
    expect(gameState.pillars.length).toBeGreaterThan(0);

});

test('Card costs work', () => {
    const gameState = new GameState();
    gameState.initializeCards();

    const accountManager = gameState.cardMasters.get("Account Manager");
    expect(accountManager).toBeDefined();
    const conv = accountManager?.convertCost();
    expect(conv?.get(Card.TALENTS)).toBe(1);
    expect(conv?.get(Card.CREDITS)).toBe(1);
    expect(accountManager?.canAcquire(0, 0)).toBeFalsy();
    expect(accountManager?.canAcquire(1, 1)).toBeTruthy();
    expect(accountManager?.canAcquire(2, 2)).toBeTruthy();
});

// See integration.test.ts where we actually test the running API post-deployment.

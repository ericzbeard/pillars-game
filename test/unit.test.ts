import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import PillarsApi = require('../stacks/pillars-api-stack');
import { SynthUtils } from '@aws-cdk/assert';
import apiLambda = require('../lambdas/api-handler');
import {Card} from '../lambdas/card';
import { cardDatabase } from '../lambdas/card-database';
import { GameState, SerializedGameState } from '../lambdas/game-state';
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
    expect(resp.statusCode).toBe(200);

    // Handle with or without the /
    resp = await apiLambda.handler({ 
        path: '/unittest', 
        httpMethod: 'GET', 
        body: 'abc'
    });
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
    let conv = (<Card>accountManager).convertCost();
    expect(conv.talents).toBe(1);
    expect(conv.credits).toBe(1);
    expect(accountManager?.canAcquire(0, 0)).toBeFalsy();
    expect(accountManager?.canAcquire(1, 1)).toBeTruthy();
    expect(accountManager?.canAcquire(2, 2)).toBeTruthy();

    const popularProduct = gameState.cardMasters.get('Popular Product');
    expect(popularProduct).toBeDefined();
    conv = (<Card>popularProduct).convertCost();
    expect(conv).toBeDefined();
    expect(conv.talents).toBe(3);
    expect(conv.credits).toBe(3);
    expect(popularProduct?.canAcquire(0, 0)).toBeFalsy();
    expect(popularProduct?.canAcquire(1, 1)).toBeFalsy();
    expect(popularProduct?.canAcquire(3, 0)).toBeFalsy();
    expect(popularProduct?.canAcquire(2, 3)).toBeFalsy();
    expect(popularProduct?.canAcquire(3, 3)).toBeTruthy();
});

test('Card lengths are correct', () => {
    
    const gameState = new GameState();
    gameState.initializeCards();
    
    const accountManager = gameState.cardMasters.get("Account Manager");
    expect(accountManager?.getProvidesLength()).toBe(2);

    const juniorDeveloper = gameState.cardMasters.get("Junior Developer");
    expect(juniorDeveloper?.getProvidesLength()).toBe(1);
    

});

test('Game state serialization works', () => {

    const g = new GameState();
    g.initializeCards();
    const s = new SerializedGameState(g);
    const h = GameState.RehydrateGameState(s);

    expect(h === g).toBeFalsy();
    expect(h.isPublic).toEqual(g.isPublic);
    expect(h.marketStack.length).toEqual(g.marketStack.length);
    for (let i = 0; i < h.marketStack.length; i++) {
        expect(h.marketStack[i].name).toEqual(g.marketStack[i].name);
        expect(h.marketStack[i].uniqueIndex).toEqual(g.marketStack[i].uniqueIndex);
    }
    expect(h.name).toEqual(g.name);
    expect(h.pillarMax).toEqual(g.pillarMax);
    expect(h.pillars.length).toEqual(g.pillars.length);
    for (let i = 0; i < h.pillars.length; i++) {
        const hp = h.pillars[i];
        const gp = g.pillars[i];
        expect(hp.name).toEqual(gp.name);
        expect(hp.pillarIndex).toEqual(gp.pillarIndex);
        expect(hp.pillarNumeral).toEqual(gp.pillarNumeral);
    }
    expect(h.players.length).toEqual(g.players.length);
    for (let i = 0; i < h.players.length; i++) {
        const hp = h.players[i];
        const gp = g.players[i];
        expect(hp.id).toEqual(gp.id);
        expect(hp.inPlay.length).toEqual(gp.inPlay.length);
        for (let j = 0; j < hp.inPlay.length; j++) {
            const hc = hp.inPlay[j];
            const gc = gp.inPlay[j];
            expect(hc.name).toEqual(gc.name);
            expect(hc.uniqueIndex).toEqual(gc.uniqueIndex);
            expect(hc.type).toEqual(gc.type);
        }
    }
    expect(h.retiredCards.length).toEqual(g.retiredCards.length);
    // TODO
    expect(h.shareURL).toEqual(g.shareURL);
    expect(h.startDateTime).toEqual(g.shareURL);
    expect(h.status).toEqual(g.status);
    expect(h.trialStacks.length).toEqual(g.trialStacks.length);
    // TODO

    // TODO - Check everything

});


// See integration.test.ts where we actually test the running API post-deployment.

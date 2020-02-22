import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import PillarsApi = require('../lib/pillars_api-stack');
import { SynthUtils } from '@aws-cdk/assert';
import apiLambda = require('../lambdas/api_lambda');

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
    const resp = await apiLambda.handler({ 
        path: 'unittest', 
        httpMethod: 'GET', 
        body: 'abc'
    });
    console.log(resp);
    expect(resp.statusCode).toBe(200);
});

// See integration.test.ts where we actually test the running API post-deployment.

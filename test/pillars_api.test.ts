import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import PillarsApi = require('../lib/pillars_api-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new PillarsApi.PillarsApiStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});

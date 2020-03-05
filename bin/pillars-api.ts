#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PillarsApiStack } from '../stacks/pillars-api-stack';

const app = new cdk.App();
new PillarsApiStack(app, 'Pillars-ezbeard', { env: { account: '916662284357', region: 'us-east-1' } });

#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PillarsApiStack } from '../stacks/pillars-api-stack';
import { PillarsAPIConfig } from '../config/pillars-api-config';

const app = new cdk.App();
new PillarsApiStack(app, `Pillars-${PillarsAPIConfig.Subdomain}`, { env: { account: PillarsAPIConfig.Account, region: 'us-east-1' } });

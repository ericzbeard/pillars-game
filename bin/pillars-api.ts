#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PillarsApiStack } from '../stacks/pillars-api-stack';
import { PillarsConfig } from '../config/pillars-config';

const app = new cdk.App();
new PillarsApiStack(app, `Pillars-${PillarsConfig.Subdomain}`, { env: { account: PillarsConfig.Account, region: 'us-east-1' } });

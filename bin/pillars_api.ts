#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PillarsApiStack } from '../lib/pillars_api-stack';

const app = new cdk.App();
new PillarsApiStack(app, 'PillarsApiStack');

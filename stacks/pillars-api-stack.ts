import * as cdk from '@aws-cdk/core';
import lambda = require('@aws-cdk/aws-lambda');
import apigw = require('@aws-cdk/aws-apigateway');
import s3 = require('@aws-cdk/aws-s3');
import dynamodb = require('@aws-cdk/aws-dynamodb');
import { ProjectionType } from '@aws-cdk/aws-dynamodb';
import { StaticSite } from './static-site';

/**
 * This stack defines:
 * 
 *  - DynamoDB Tables
 *  - Lambda Functions
 *  - API Gateways
 *  - S3 Bucket for the web site
 *  - CloudFront distro for the web site
 */
export class PillarsApiStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Users Table - less necessary with Cognito, but we still need some fields
        const usersTable = new dynamodb.Table(this, 'UsersTable', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            pointInTimeRecovery: true
        });

        const envVars = {
            "USER_TABLE": usersTable.tableName
        };

        // Public REST API Lambda Function
        const apiLambda = new lambda.Function(this, 'ApiLambda', {
            runtime: lambda.Runtime.NODEJS_12_X,
            code: lambda.Code.asset('lambdas'),
            handler: 'api-handler.handler',
            memorySize: 1536,
            timeout: cdk.Duration.minutes(1),
            description: 'Pillars API',
            environment: envVars
        });

        // API Gateway for the public API (no auth)
        const api = new apigw.LambdaRestApi(this, "PublicApiGateway", {
            handler: apiLambda
        });

        const subdomain = this.node.tryGetContext('subdomain');
        if (!subdomain) {
            throw Error('Missing subdomain. E.g. cdk synth -c subdomain=local');
        }

        // Static web site
        // cdk synth -c subdomain=dev
        new StaticSite(this, 'StaticSite', {
            domainName: 'pillars.click',
            siteSubDomain: subdomain,
        });

    }
}

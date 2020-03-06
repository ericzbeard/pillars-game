#!/usr/bin/env node
import cloudfront = require('@aws-cdk/aws-cloudfront');
import route53 = require('@aws-cdk/aws-route53');
import s3 = require('@aws-cdk/aws-s3');
import s3deploy = require('@aws-cdk/aws-s3-deployment');
import acm = require('@aws-cdk/aws-certificatemanager');
import cdk = require('@aws-cdk/core');
import targets = require('@aws-cdk/aws-route53-targets/lib');
import { Construct } from '@aws-cdk/core';
import { PillarsConfig } from '../config/pillars-config';
import { PolicyStatement, CanonicalUserPrincipal } from '@aws-cdk/aws-iam';

export interface StaticSiteProps {
    domainName: string;
    siteSubDomain: string;
}

/**
 * Static site infrastructure, which deploys site content to an S3 bucket.
 *
 * The site redirects from HTTP to HTTPS, using a CloudFront distribution,
 * Route53 alias record, and ACM certificate.
 */
export class StaticSite extends Construct {
    constructor(parent: Construct, name: string, props: StaticSiteProps) {
        super(parent, name);

        // pillars.click zone needs to be created manually first...
        const zone = route53.HostedZone.fromLookup(this, 'Zone', { domainName: props.domainName });
        const siteDomain = props.siteSubDomain + '.' + props.domainName;
        new cdk.CfnOutput(this, 'Site', { value: 'https://' + siteDomain });

        // Content bucket
        const siteBucket = new s3.Bucket(this, 'SiteBucket', {
            bucketName: siteDomain,
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'error.html',
            publicReadAccess: false,

            // The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
            // the new bucket, and it will remain in your account until manually deleted. By setting the policy to
            // DESTROY, cdk destroy will attempt to delete the bucket, but will error if the bucket is not empty.
            removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
        });
        new cdk.CfnOutput(this, 'Bucket', { value: siteBucket.bucketName });

        // // TLS certificate
        // const certificateArn = new acm.DnsValidatedCertificate(this, 'SiteCertificate', {
        //     domainName: siteDomain,
        //     hostedZone: zone
        // }).certificateArn;
        // new cdk.CfnOutput(this, 'Certificate', { value: certificateArn });

        // This takes too long, times out, and causes the stack to fail.
        // Pre-create the cert
        // TODO - Put this in environment config
        const certificateArn = PillarsConfig.CertificateArn;

        const oai = new cloudfront.CfnCloudFrontOriginAccessIdentity(this, 'OAI', {
            cloudFrontOriginAccessIdentityConfig: { comment: siteDomain }
        });
        
        // Restrict the S3 bucket via a bucket policy that only allows our CloudFront distribution
        const bucketPolicy = new PolicyStatement({
            principals: [new CanonicalUserPrincipal(oai.attrS3CanonicalUserId)],
            actions: ['s3:GetObject'],
            resources: [siteBucket.arnForObjects('*')],
        })
        siteBucket.addToResourcePolicy(bucketPolicy);

        // CloudFront distribution that provides HTTPS
        const distribution = new cloudfront.CloudFrontWebDistribution(this, 'SiteDistribution', {
            aliasConfiguration: {
                acmCertRef: certificateArn,
                names: [ siteDomain ],
                sslMethod: cloudfront.SSLMethod.SNI,
                securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_1_2016,
            },
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: siteBucket, 
                        originAccessIdentity: cloudfront.OriginAccessIdentity.fromOriginAccessIdentityName(this, 'OAIRef', oai.ref)
                    },
                    behaviors : [ {isDefaultBehavior: true}]
                }
            ]
        });
        new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId });

        // Route53 alias record for the CloudFront distribution
        new route53.ARecord(this, 'SiteAliasRecord', {
            recordName: siteDomain,
            target: route53.AddressRecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
            zone
        });

        // Deploy site contents to S3 bucket
        new s3deploy.BucketDeployment(this, 'DeployWithInvalidation', {
            sources: [ s3deploy.Source.asset('./web/dist') ],
            destinationBucket: siteBucket,
            distribution,
            distributionPaths: ['/*'],
          });
    }
}
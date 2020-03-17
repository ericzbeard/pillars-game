# Pillars of AWS Game (aka AWS Build)

*Not yet functional! Still lots of cards to implement, and it only works in solo mode*

This project has the backend and a web canvas UI for the AWS Deck Building game "AWS Build", codename "Pillars".

It uses CDK for infrastructure deployment, Typescript as the default language, Lambda and API Gateway for the REST API, and DynamoDB for data storage.

This project is a prototype, with everything in one repo. Eventually we'll want to split out the web project and figure out what to do with shared resources like cards and game-state.

## A few things you should install globally

```
npm install -g aws-cdk
npm install -g typescript
npm install -g browserify
```

## Building and deploying

Before building, you will need to create config/local-config.ts, based on config/config.sample.ts.

If you want to deploy to your AWS account, add another config file similar to local-config.ts with your environment name and add it to bin/pillars-api.ts.

```
# Compile and unit test
npm run build
npm run test

# Local UI testing
cd web/dist
http-serve --cors

# Deploy
npm run build-{env}
npm run deploy-{env}




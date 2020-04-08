# Pillars of AWS Game (aka AWS Build)

*Not yet functional! Still lots of cards to implement, and it only works in solo mode*

*Also, this is a hobby project coded by one person, and not an official AWS app*

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

Before building, you will need to create config/local-web-config.ts and config/local-api-config.ts, based on config/web-config-sample.ts and config/api-config-sample.ts.

Copy the config files:
```
cp config/web-config-sample.ts config/local-web-config.ts
cp config/api-config-sample.ts config/local-api-config.ts
```
Then edit them to remove the comments.

If you want to deploy to your AWS account, add another config file similar to local-config.ts with your environment name.

E.g.
```
cp config/web-config-sample.ts config/ezbeard-web-config.ts
cp config/api-config-sample.ts config/ezbeard-api-config.ts
```

# Compile and unit test
```
npm run build
npm run test
```

# Local UI testing
```
cd web/dist
http-serve --cors
```

# Deploy
```
npm run build-{env}
npm run deploy-{env}
```

# TODO

- Tutorial
- Finish card actions
- Safari/iOS drag and drop
- Drag bugs
- Highlight locked dice
- If no markets cards purchased, give option to shuffle
- Animate card to player during other turns
- Turn switch race condition



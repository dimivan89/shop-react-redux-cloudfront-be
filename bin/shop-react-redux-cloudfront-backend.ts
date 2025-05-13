#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ProductServiceStack } from '../lib/product-service-stack';
import { ImportServiceStack } from '../lib/import-service-stack';

const app = new cdk.App();

new ProductServiceStack(app, 'ProductServiceStack', {
  /* If you want to specify env like region/account, you can add it here: */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

new ImportServiceStack(app, 'ImportServiceStack', {
  env: { region: 'us-east-1' },
});
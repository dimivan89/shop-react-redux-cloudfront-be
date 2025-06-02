#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ProductServiceStack } from '../lib/product-service-stack';
import { ImportServiceStack } from '../lib/import-service-stack';
import { AuthorizationServiceStack } from '../lib/authorization-service-stack';
import { ImportApiGatewayStack } from '../lib/import-api-gateway-stack';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdkFn from 'aws-cdk-lib';

const app = new cdk.App();

new AuthorizationServiceStack(app, 'AuthorizationServiceStack', {
  env: { region: 'us-east-1' },
});

new ImportServiceStack(app, 'ImportServiceStack', {
  env: { region: 'us-east-1' },
});

new ImportApiGatewayStack(app, 'ImportApiGatewayStack', {
  env: { region: 'us-east-1' }
});

new ProductServiceStack(app, 'ProductServiceStack', {
  env: { region: 'us-east-1' },
});
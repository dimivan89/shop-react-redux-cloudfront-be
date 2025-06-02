import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { CfnOutput } from 'aws-cdk-lib';

dotenv.config(); // load credentials from .env

export class AuthorizationServiceStack extends cdk.Stack {  
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const basicAuthorizerLambda = new lambda.Function(this, 'BasicAuthorizerLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'basicAuthorizer.handler',
      code: lambda.Code.fromAsset('dist'),
      functionName: 'basicAuthorizerLambda',
      environment: {
        [process.env.GITHUB_USERNAME!]: process.env.TEST_PASSWORD!,
      },
    });
    
    new CfnOutput(this, 'BasicAuthorizerLambdaArn', {
      value: basicAuthorizerLambda.functionArn,
      exportName: 'BasicAuthorizerLambdaArn',
    });
  }
}

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class ImportApiGatewayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const api = new apigateway.RestApi(this, 'ImportServiceAPI', {
      restApiName: 'Import Service API',
    });
    
    // Import Lambda from ImportServiceStack
    const importLambda = lambda.Function.fromFunctionAttributes(this, 'ImportProductsFileLambda', {
      functionArn: cdk.Fn.importValue('ImportProductsFileLambdaArn'),
      sameEnvironment: true,
    });
    
    const authorizerFn = lambda.Function.fromFunctionAttributes(this, 'AuthorizerFunction', {
      functionArn: cdk.Fn.importValue('BasicAuthorizerLambdaArn'),
      sameEnvironment: true,
    });

    const authorizer = new apigateway.TokenAuthorizer(this, 'ImportAuthorizer', {
      handler: authorizerFn,
      identitySource: 'method.request.header.Authorization',
    });

    const importResource = api.root.addResource('import');

    importResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(importLambda),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.CUSTOM,
      }
    );
  }
}

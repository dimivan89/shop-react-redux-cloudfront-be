import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const api = new apigateway.RestApi(this, 'ProductApi', {
      restApiName: 'Product Service',
    });

    const getProductsList = new lambda.Function(this, 'getProductsList', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'getProductsList.handler',
      code: lambda.Code.fromAsset('dist'),
      functionName: 'getProductsListLambda',
      environment: {
        PRODUCTS_TABLE: 'products',
        STOCK_TABLE: 'stock'
      }
    });

    const productsResource = api.root.addResource('products');
    productsResource.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: ['GET', 'POST', 'OPTIONS'],
    });
    productsResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsList));

    const getProductsById = new lambda.Function(this, 'getProductsById', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'getProductById.handler',
      code: lambda.Code.fromAsset('dist'),
      functionName: 'getProductsByIdLambda',
      environment: {
        PRODUCTS_TABLE: 'products',
        STOCK_TABLE: 'stock'
      }
    });

    const productByIdResource = productsResource.addResource('{productId}');
    productByIdResource.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: ['GET', 'OPTIONS'],
    });
    productByIdResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsById));
    
    const createProduct = new lambda.Function(this, 'createProductLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'createProduct.handler',
      code: lambda.Code.fromAsset('dist'),
      functionName: 'createProductLambda',
      environment: {
        PRODUCTS_TABLE: 'products',
        STOCK_TABLE: 'stock',
      },
    });
    
    productsResource.addMethod('POST', new apigateway.LambdaIntegration(createProduct));

    
    const productsTable = dynamodb.Table.fromTableName(this, 'ProductsTable', 'products');
    const stockTable = dynamodb.Table.fromTableName(this, 'StockTable', 'stock');

    productsTable.grantReadData(getProductsList);
    stockTable.grantReadData(getProductsList);

    productsTable.grantReadData(getProductsById);
    stockTable.grantReadData(getProductsById);
    
    productsTable.grantWriteData(createProduct);
    stockTable.grantWriteData(createProduct);

    // 1. Create the SQS queue
    const catalogItemsQueue = new sqs.Queue(this, 'CatalogItemsQueue', {
      visibilityTimeout: cdk.Duration.seconds(30),
    });

    // 2. Create the Lambda function
    const catalogBatchProcessLambda = new lambda.Function(this, 'CatalogBatchProcessLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'catalogBatchProcess.handler',
      code: lambda.Code.fromAsset('dist'),
      functionName: 'catalogBatchProcessLambda',
      environment: {
        PRODUCTS_TABLE: 'products',
        STOCK_TABLE: 'stock'
      },
    });
    
    // 3. Grant permissions to write to DynamoDB
    productsTable.grantWriteData(catalogBatchProcessLambda);
    stockTable.grantWriteData(catalogBatchProcessLambda);

    // 4. Connect SQS to Lambda with batch size = 5
    catalogBatchProcessLambda.addEventSource(
      new lambdaEventSources.SqsEventSource(catalogItemsQueue, {
        batchSize: 5,
      })
    );
  }
}
